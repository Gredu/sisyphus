<script setup lang="ts">
import type { FinalizedEntry } from '~/composables/useWorkEntries'
import { VueDraggable } from 'vue-draggable-plus'

const { isWorking, isStopped, isFinalized, currentView, finalizedEntries, entries, loadEntries, startNowTimer, stopNowTimer, showHotkeys, editingField, editingIndex, threshold, roundOrder, collapse, defaultPrimaryThreshold, timeFormat, getActiveEntry, stopWorking, continueWorking, startOver } = useWorkEntries()
type TimeEntry = typeof entries.value[number]
const selectedSuggestionIndex = ref(0)

const primaryThresholds = ref<Record<string, number>>({})

function getThreshold(date: string): number {
  return primaryThresholds.value[date] ?? defaultPrimaryThreshold.value
}

function getThresholdHours(date: string): string {
  return Math.floor(getThreshold(date) / 60).toString().padStart(2, '0')
}

function getThresholdMinutes(date: string): string {
  return (getThreshold(date) % 60).toString().padStart(2, '0')
}

function setThresholdHours(date: string, hours: string) {
  primaryThresholds.value[date] = Number(hours) * 60 + (getThreshold(date) % 60)
}

function setThresholdMinutes(date: string, minutes: string) {
  primaryThresholds.value[date] = Math.floor(getThreshold(date) / 60) * 60 + Number(minutes)
}

const thresholdHourOptions = Array.from({ length: 24 }, (_, i) => ({
  label: i.toString().padStart(2, '0'),
  value: i.toString().padStart(2, '0')
}))
const thresholdMinuteOptions = Array.from({ length: 60 }, (_, i) => ({
  label: i.toString().padStart(2, '0'),
  value: i.toString().padStart(2, '0')
}))

function displayDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

const currentTime = ref(new Date())
const colonVisible = ref(true)
let clockInterval: ReturnType<typeof setInterval>

const clockHours = computed(() => currentTime.value.getHours().toString().padStart(2, '0'))
const clockMinutes = computed(() => currentTime.value.getMinutes().toString().padStart(2, '0'))

interface DayGroup {
  date: string
  label: string
  entries: typeof entries.value
}

const entriesByDate = computed<DayGroup[]>(() => {
  const groups = new Map<string, typeof entries.value>()
  for (const entry of entries.value) {
    const date = entry.date || '1970-01-01'
    if (!groups.has(date)) groups.set(date, [])
    groups.get(date)!.push(entry)
  }
  return [...groups.entries()]
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([date, dayEntries]) => ({
      date,
      label: displayDate(date),
      entries: dayEntries
    }))
})

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

function fmtDuration(minutes: number): string {
  if (timeFormat.value === 'decimal') {
    return (minutes / 60).toFixed(2)
  }
  const hh = Math.floor(minutes / 60).toString().padStart(2, '0')
  const mm = (minutes % 60).toString().padStart(2, '0')
  return `${hh}:${mm}`
}

function calcMinutesFromTimes(start: string, end: string): number {
  const [sh = 0, sm = 0] = start.split(':').map(Number)
  const [eh = 0, em = 0] = end.split(':').map(Number)
  return (eh * 60 + em) - (sh * 60 + sm)
}

interface Badge {
  icon?: string
  label?: string
  duration: string
  primary?: boolean
}

function buildBadges(date: string, items: { category: string, minutes: number }[], thresholdTotal?: number): Badge[] {
  let totalMinutes = 0
  const excluded = new Map<string, number>()
  for (const item of items) {
    if (item.category.startsWith('!')) {
      const name = item.category.slice(1)
      excluded.set(name, (excluded.get(name) || 0) + item.minutes)
    } else {
      totalMinutes += item.minutes
    }
  }
  const compareTotal = thresholdTotal ?? totalMinutes
  const badges: Badge[] = [{ icon: 'i-lucide-sigma', duration: fmtDuration(totalMinutes), primary: compareTotal >= getThreshold(date) }]
  for (const [name, minutes] of excluded) {
    badges.push({ label: name, duration: fmtDuration(minutes) })
  }
  return badges
}

function finalizeForDay(dayEntries: typeof entries.value): FinalizedEntry[] {
  const nowTime = `${clockHours.value}:${clockMinutes.value}`
  const roundInterval = threshold.value !== 'none' ? Number(threshold.value) : 0
  const roundUpVal = (m: number, interval: number) => Math.ceil(m / interval) * interval
  const includable = dayEntries.filter(e => e.endTime || e.category || e.content)

  if (!collapse.value) {
    return includable.map((e) => {
      let minutes = calcMinutesFromTimes(e.startTime, e.endTime || nowTime)
      if (roundInterval > 0) minutes = roundUpVal(minutes, roundInterval)
      return { duration: fmtDuration(minutes), category: e.category, content: e.content }
    })
  }

  const grouped = new Map<string, { totalMinutes: number, contents: string[] }>()
  for (const e of includable) {
    let minutes = calcMinutesFromTimes(e.startTime, e.endTime || nowTime)
    if (roundInterval > 0 && roundOrder.value === 'before') minutes = roundUpVal(minutes, roundInterval)
    const existing = grouped.get(e.category)
    if (existing) {
      existing.totalMinutes += minutes
      if (e.content && !existing.contents.includes(e.content)) existing.contents.push(e.content)
    } else {
      grouped.set(e.category, { totalMinutes: minutes, contents: e.content ? [e.content] : [] })
    }
  }

  const { joinCharacter } = useWorkEntries()
  return [...grouped.entries()].map(([category, data]) => {
    let minutes = data.totalMinutes
    if (roundInterval > 0 && roundOrder.value === 'after') minutes = roundUpVal(minutes, roundInterval)
    return {
      duration: fmtDuration(minutes),
      category,
      content: data.contents.join(joinCharacter.value + ' ')
    }
  })
}

function parseDurationToMinutes(duration: string): number {
  if (duration.includes(':')) {
    const [h, m] = duration.split(':').map(Number)
    return (h ?? 0) * 60 + (m ?? 0)
  }
  return Math.round(Number(duration) * 60)
}

function summaryBadgesForDay(date: string, dayEntries: typeof entries.value): Badge[] {
  const finalized = finalizeForDay(dayEntries)
  return buildBadges(date, finalized.map((e) => {
    return { category: e.category, minutes: parseDurationToMinutes(e.duration) }
  }))
}

function recordBadges(date: string, dayEntries: typeof entries.value): Badge[] {
  const nowTime = `${clockHours.value}:${clockMinutes.value}`
  const includable = dayEntries.filter(e => e.endTime || e.category || e.content)
  const roundInterval = threshold.value !== 'none' ? Number(threshold.value) : 0
  const roundUpVal = (m: number, interval: number) => Math.ceil(m / interval) * interval

  // Compute rounded total for threshold comparison
  let roundedTotal = 0
  if (!collapse.value) {
    for (const e of includable) {
      if (e.category.startsWith('!')) continue
      let mins = calcMinutesFromTimes(e.startTime, e.endTime || nowTime)
      if (roundInterval > 0) mins = roundUpVal(mins, roundInterval)
      roundedTotal += mins
    }
  } else {
    const grouped = new Map<string, number>()
    for (const e of includable) {
      if (e.category.startsWith('!')) continue
      let mins = calcMinutesFromTimes(e.startTime, e.endTime || nowTime)
      if (roundInterval > 0 && roundOrder.value === 'before') mins = roundUpVal(mins, roundInterval)
      grouped.set(e.category, (grouped.get(e.category) || 0) + mins)
    }
    for (const [, mins] of grouped) {
      roundedTotal += roundInterval > 0 && roundOrder.value === 'after' ? roundUpVal(mins, roundInterval) : mins
    }
  }

  return buildBadges(date, includable.map((e) => {
    const minutes = calcMinutesFromTimes(e.startTime, e.endTime || nowTime)
    return { category: e.category, minutes }
  }), roundedTotal)
}

// Calendar view
const today = computed(() => currentTime.value.toISOString().split('T')[0])
const calendarMonth = ref(new Date())

const calendarMonthLabel = computed(() => {
  return calendarMonth.value.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
})

function calendarPrevMonth() {
  const d = new Date(calendarMonth.value)
  d.setMonth(d.getMonth() - 1)
  calendarMonth.value = d
}

function calendarNextMonth() {
  const d = new Date(calendarMonth.value)
  d.setMonth(d.getMonth() + 1)
  calendarMonth.value = d
}

function calendarGoToday() {
  calendarMonth.value = new Date()
}

const isCurrentMonthView = computed(() => {
  const now = new Date()
  return calendarMonth.value.getFullYear() === now.getFullYear() && calendarMonth.value.getMonth() === now.getMonth()
})

interface CalendarDay {
  date: string
  day: number
  isCurrentMonth: boolean
  total: string | null
  totalPrimary: boolean
  categories: { name: string, duration: string }[]
}

const calendarDays = computed<CalendarDay[]>(() => {
  const year = calendarMonth.value.getFullYear()
  const month = calendarMonth.value.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)

  // Monday = 0, Sunday = 6
  const startDow = (firstDay.getDay() + 6) % 7
  const days: CalendarDay[] = []

  // Build entries lookup by date
  const nowTime = `${clockHours.value}:${clockMinutes.value}`
  const byDate = new Map<string, typeof entries.value>()
  for (const entry of entries.value) {
    const date = entry.date || '1970-01-01'
    if (!byDate.has(date)) byDate.set(date, [])
    byDate.get(date)!.push(entry)
  }

  // Fill leading days from previous month
  for (let i = startDow - 1; i >= 0; i--) {
    const d = new Date(year, month, -i)
    days.push({ date: fmt(d), day: d.getDate(), isCurrentMonth: false, total: null, totalPrimary: false, categories: [] })
  }

  // Current month days
  for (let d = 1; d <= lastDay.getDate(); d++) {
    const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`
    const dayEntries = byDate.get(dateStr)
    if (!dayEntries || dayEntries.length === 0) {
      days.push({ date: dateStr, day: d, isCurrentMonth: true, total: null, totalPrimary: false, categories: [] })
      continue
    }

    const roundInterval = threshold.value !== 'none' ? Number(threshold.value) : 0
    const roundUp = (m: number, interval: number) => Math.ceil(m / interval) * interval
    const includable = dayEntries.filter(e => e.category || e.content)

    let totalMinutes = 0
    let categories: { name: string, duration: string }[]

    if (!collapse.value) {
      // No grouping — each entry individually, optionally rounded
      const catMap = new Map<string, number>()
      for (const e of includable) {
        let mins = calcMinutesFromTimes(e.startTime, e.endTime || nowTime)
        if (roundInterval > 0) mins = roundUp(mins, roundInterval)
        if (!e.category.startsWith('!')) totalMinutes += mins
        catMap.set(e.category, (catMap.get(e.category) || 0) + mins)
      }
      categories = [...catMap.entries()].map(([name, mins]) => ({ name, duration: fmtDuration(mins) }))
    } else {
      // Grouped by category with round order setting
      const grouped = new Map<string, number>()
      for (const e of includable) {
        let mins = calcMinutesFromTimes(e.startTime, e.endTime || nowTime)
        if (roundInterval > 0 && roundOrder.value === 'before') mins = roundUp(mins, roundInterval)
        grouped.set(e.category, (grouped.get(e.category) || 0) + mins)
      }
      if (roundInterval > 0 && roundOrder.value === 'after') {
        for (const [cat, mins] of grouped) {
          grouped.set(cat, roundUp(mins, roundInterval))
        }
      }
      for (const [cat, mins] of grouped) {
        if (!cat.startsWith('!')) totalMinutes += mins
      }
      categories = [...grouped.entries()].map(([name, mins]) => ({ name, duration: fmtDuration(mins) }))
    }

    days.push({
      date: dateStr,
      day: d,
      isCurrentMonth: true,
      total: totalMinutes > 0 ? fmtDuration(totalMinutes) : null,
      totalPrimary: totalMinutes >= getThreshold(dateStr),
      categories
    })
  }

  // Fill trailing days to complete the grid (6 rows)
  const remaining = 42 - days.length
  for (let i = 1; i <= remaining; i++) {
    const d = new Date(year, month + 1, i)
    days.push({ date: fmt(d), day: d.getDate(), isCurrentMonth: false, total: null, totalPrimary: false, categories: [] })
  }

  return days
})

function fmt(d: Date): string {
  return d.toISOString().split('T')[0]!
}

const weekDayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const knownCategories = computed(() => {
  const cats = new Set<string>()
  for (const entry of entries.value) {
    if (entry.category) cats.add(entry.category)
  }
  return [...cats]
})

const suggestions = computed(() => {
  const current = getActiveEntry()
  if (!current || editingField.value !== 'category' || !current.category) return []
  return knownCategories.value.filter(
    c => c.toLowerCase().startsWith(current.category.toLowerCase()) && c.toLowerCase() !== current.category.toLowerCase()
  )
})

watch(suggestions, () => {
  selectedSuggestionIndex.value = 0
})

function acceptSuggestion() {
  const current = getActiveEntry()
  if (!current || !current.category) return
  if (suggestions.value.length > 0) {
    current.category = suggestions.value[selectedSuggestionIndex.value]!
  }
  selectedSuggestionIndex.value = 0
  editingField.value = 'content'
}

function currentDateStr(): string {
  return new Date().toISOString().split('T')[0]!
}

function startNewEntry() {
  const d = new Date()
  const now = formatTime(d)
  const dateStr = currentDateStr()

  if (!isWorking.value) {
    isWorking.value = true
    entries.value.push({ id: crypto.randomUUID(), date: dateStr, startTime: now, endTime: null, category: '', content: '' })
    editingField.value = 'category'
  } else {
    const current = getActiveEntry()
    if (current) current.endTime = now
    entries.value.push({ id: crypto.randomUUID(), date: dateStr, startTime: now, endTime: null, category: '', content: '' })
    editingField.value = 'category'
  }
  selectedSuggestionIndex.value = 0
}

function isActiveEntry(entry: TimeEntry): boolean {
  return !entry.endTime && editingIndex.value === null && !isStopped.value
}

function handleKeydown(event: KeyboardEvent) {
  if (editingIndex.value !== null) return
  if (isStopped.value || isFinalized.value) return

  if (event.key === 'Enter') {
    event.preventDefault()
    if (isWorking.value && editingField.value === 'category') {
      const current = getActiveEntry()
      if (!current?.category) return
      if (suggestions.value.length > 0) {
        acceptSuggestion()
        return
      }
      editingField.value = 'content'
      selectedSuggestionIndex.value = 0
      return
    }
    if (isWorking.value && editingField.value === 'content') {
      const current = getActiveEntry()
      if (!current?.category) return
    }
    startNewEntry()
    return
  }

  if (!isWorking.value) return

  if (event.key === 'Tab' && editingField.value === 'category') {
    event.preventDefault()
    if (suggestions.value.length > 1) {
      if (event.shiftKey) {
        selectedSuggestionIndex.value = (selectedSuggestionIndex.value - 1 + suggestions.value.length) % suggestions.value.length
      } else {
        selectedSuggestionIndex.value = (selectedSuggestionIndex.value + 1) % suggestions.value.length
      }
    } else {
      acceptSuggestion()
    }
    return
  }

  if (event.key === ' ' && editingField.value === 'category') {
    event.preventDefault()
    const current = getActiveEntry()
    if (!current?.category) return
    editingField.value = 'content'
    selectedSuggestionIndex.value = 0
    return
  }

  const current = getActiveEntry()
  if (!current) return

  const field = editingField.value

  if (event.key === 'Backspace') {
    if (current[field].length === 0 && field === 'content') {
      editingField.value = 'category'
    } else if (current[field].length === 0 && field === 'category' && entries.value.length > 1) {
      const activeIdx = entries.value.indexOf(current)
      if (activeIdx !== -1) entries.value.splice(activeIdx, 1)
      const previous = entries.value[entries.value.length - 1]
      if (previous) {
        previous.endTime = null
        editingField.value = previous.content ? 'content' : previous.category ? 'content' : 'category'
      }
    } else {
      current[field] = current[field].slice(0, -1)
    }
  } else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey) {
    event.preventDefault()
    current[field] += event.key
  }
}

function deleteEntry(entry: TimeEntry) {
  const idx = entries.value.indexOf(entry)
  if (idx === -1) return
  if (entries.value.length === 1) {
    startOver()
    return
  }
  const wasActive = !entry.endTime
  entries.value.splice(idx, 1)
  if (wasActive && entries.value.length > 0) {
    const last = entries.value[entries.value.length - 1]
    if (last) last.endTime = null
  }
}

// Copy feedback
const copiedId = ref<string | null>(null)
let copiedTimeout: ReturnType<typeof setTimeout>

function showCopied(id: string) {
  copiedId.value = id
  clearTimeout(copiedTimeout)
  copiedTimeout = setTimeout(() => {
    copiedId.value = null
  }, 1500)
}

function formatRecordText(entry: TimeEntry): string {
  const end = entry.endTime || `${clockHours.value}:${clockMinutes.value}`
  return `${entry.startTime} ${end} ${entry.category}: ${entry.content}`
}

function formatFinalizedText(entry: FinalizedEntry): string {
  return `${entry.duration} ${entry.category}: ${entry.content}`
}

function copyDayRecords(group: DayGroup) {
  const completed = group.entries.filter(e => e.endTime)
  const text = completed.map(formatRecordText).join('\n')
  navigator.clipboard.writeText(text)
  showCopied(`day-${group.date}`)
}

function copyDaySummary(group: DayGroup) {
  const finalized = finalizeForDay(group.entries)
  const text = finalized.map(formatFinalizedText).join('\n')
  navigator.clipboard.writeText(text)
  showCopied(`day-${group.date}`)
}

function copyRecord(entry: TimeEntry, index: number) {
  navigator.clipboard.writeText(formatRecordText(entry))
  showCopied(`record-${index}`)
}

function copyFinalizedRecord(entry: FinalizedEntry, index: number) {
  navigator.clipboard.writeText(formatFinalizedText(entry))
  showCopied(`finalized-${index}`)
}

watch(entries, () => {
  localStorage.setItem('sisyphus-entries', JSON.stringify(entries.value))
}, { deep: true })

watch(primaryThresholds, (v) => {
  localStorage.setItem('sisyphus-primary-thresholds', JSON.stringify(v))
}, { deep: true })

// Drag-to-reorder
function onDragEnd(event: { oldIndex?: number, newIndex?: number, from: HTMLElement, item: HTMLElement }, groupDate: string) {
  if (event.oldIndex === undefined || event.newIndex === undefined) return
  if (event.oldIndex === event.newIndex) return

  // Revert DOM — let Vue handle it via reactivity
  event.from.removeChild(event.item)
  event.from.insertBefore(event.item, event.from.children[event.oldIndex] || null)

  const group = entriesByDate.value.find(g => g.date === groupDate)
  if (!group) return

  const movedEntry = group.entries[event.oldIndex]
  const targetEntry = group.entries[event.newIndex]
  if (!movedEntry || !targetEntry) return

  const oldFlatIdx = entries.value.findIndex(e => e.id === movedEntry.id)
  const [moved] = entries.value.splice(oldFlatIdx, 1)
  if (!moved) return

  let newFlatIdx = entries.value.findIndex(e => e.id === targetEntry.id)
  if (event.oldIndex < event.newIndex) newFlatIdx++
  entries.value.splice(newFlatIdx, 0, moved)
}

onMounted(() => {
  loadEntries()
  const storedThresholds = localStorage.getItem('sisyphus-primary-thresholds')
  if (storedThresholds) primaryThresholds.value = JSON.parse(storedThresholds)
  window.addEventListener('keydown', handleKeydown)
  startNowTimer()
  clockInterval = setInterval(() => {
    currentTime.value = new Date()
    colonVisible.value = !colonVisible.value
  }, 500)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  stopNowTimer()
  clearInterval(clockInterval)
})
</script>

<template>
  <div class="flex-1">
    <div class="p-8">
      <div
        v-if="showHotkeys"
        class="rounded-lg border border-default bg-default/50 px-4 py-3 mb-6"
      >
        <div class="flex items-center gap-2 mb-2">
          <UIcon
            name="i-lucide-keyboard"
            class="size-4 text-primary"
          />
          <span class="text-sm font-semibold">Available Hotkeys</span>
        </div>
        <div class="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
          <template v-if="isFinalized">
            <span class="text-muted">No keyboard shortcuts in Summarize View</span>
          </template>
          <template v-else-if="isStopped">
            <span class="text-muted">No keyboard shortcuts while stopped</span>
          </template>
          <template v-else-if="editingField === 'category'">
            <kbd class="font-mono text-xs bg-default border border-default rounded px-1.5 py-0.5">Enter</kbd>
            <span class="text-muted">Accept category and move to content</span>
            <kbd class="font-mono text-xs bg-default border border-default rounded px-1.5 py-0.5">Tab</kbd>
            <span class="text-muted">Autocomplete suggestion / cycle through suggestions</span>
            <kbd class="font-mono text-xs bg-default border border-default rounded px-1.5 py-0.5">Shift+Tab</kbd>
            <span class="text-muted">Cycle suggestions in reverse</span>
            <kbd class="font-mono text-xs bg-default border border-default rounded px-1.5 py-0.5">Space</kbd>
            <span class="text-muted">Accept category as-is, move to content</span>
            <kbd class="font-mono text-xs bg-default border border-default rounded px-1.5 py-0.5">Backspace</kbd>
            <span class="text-muted">Delete character / go back to previous entry</span>
            <kbd class="font-mono text-xs bg-default border border-default rounded px-1.5 py-0.5">A-Z, 0-9</kbd>
            <span class="text-muted">Type category name</span>
          </template>
          <template v-else>
            <kbd class="font-mono text-xs bg-default border border-default rounded px-1.5 py-0.5">Enter</kbd>
            <span class="text-muted">Finish entry and start a new one</span>
            <kbd class="font-mono text-xs bg-default border border-default rounded px-1.5 py-0.5">Backspace</kbd>
            <span class="text-muted">Delete character / go back to category</span>
            <kbd class="font-mono text-xs bg-default border border-default rounded px-1.5 py-0.5">A-Z, 0-9</kbd>
            <span class="text-muted">Type content</span>
          </template>
        </div>
      </div>

      <!-- Calendar View -->
      <div
        v-if="currentView === 'calendar'"
        class="py-4"
      >
        <div class="flex items-center justify-between mb-4">
          <UButton
            icon="i-lucide-chevron-left"
            color="neutral"
            variant="ghost"
            @click="calendarPrevMonth"
          />
          <div class="flex items-center gap-2">
            <h2 class="text-lg font-bold">
              {{ calendarMonthLabel }}
            </h2>
            <UButton
              v-if="!isCurrentMonthView"
              label="Today"
              color="neutral"
              variant="subtle"
              size="xs"
              @click="calendarGoToday"
            />
          </div>
          <UButton
            icon="i-lucide-chevron-right"
            color="neutral"
            variant="ghost"
            @click="calendarNextMonth"
          />
        </div>

        <div class="grid grid-cols-7 gap-px bg-default/50 rounded-lg border border-default overflow-hidden">
          <div
            v-for="label in weekDayLabels"
            :key="label"
            class="text-center text-xs font-semibold text-muted py-2 bg-default/80"
          >
            {{ label }}
          </div>
          <div
            v-for="(day, i) in calendarDays"
            :key="i"
            class="min-h-24 p-1.5 bg-default/30"
            :class="[
              day.isCurrentMonth ? '' : 'opacity-30',
              day.date === today ? 'ring-1 ring-primary' : ''
            ]"
          >
            <div
              class="text-xs font-mono mb-1"
              :class="day.isCurrentMonth ? 'text-foreground' : 'text-muted'"
            >
              {{ day.day }}
            </div>
            <UPopover v-if="day.total">
              <UBadge
                :color="day.totalPrimary ? 'primary' : 'neutral'"
                variant="subtle"
                class="text-[10px] mb-1 cursor-pointer"
              >
                <UIcon
                  name="i-lucide-sigma"
                  class="size-3"
                />
                {{ day.total }}
              </UBadge>
              <template #content>
                <div
                  class="flex items-center gap-1 p-2"
                  @keydown.stop
                >
                  <USelect
                    :model-value="getThresholdHours(day.date)"
                    :items="thresholdHourOptions"
                    class="w-20"
                    size="sm"
                    @update:model-value="setThresholdHours(day.date, $event)"
                  />
                  <span class="text-sm font-mono font-bold">:</span>
                  <USelect
                    :model-value="getThresholdMinutes(day.date)"
                    :items="thresholdMinuteOptions"
                    class="w-20"
                    size="sm"
                    @update:model-value="setThresholdMinutes(day.date, $event)"
                  />
                </div>
              </template>
            </UPopover>
            <div
              v-for="cat in day.categories"
              :key="cat.name"
              class="text-[10px] text-muted truncate"
            >
              <span class="font-mono">{{ cat.duration }}</span> {{ cat.name }}
            </div>
          </div>
        </div>
      </div>

      <!-- Summarize View -->
      <div v-else-if="isFinalized">
        <div
          v-for="group in entriesByDate"
          :key="group.date"
          class="mb-8"
        >
          <div class="flex items-center gap-2 mb-4">
            <h1 class="text-2xl font-bold">
              {{ group.label }}
            </h1>
            <UPopover :open="copiedId === `day-${group.date}`">
              <UButton
                icon="i-lucide-copy"
                color="neutral"
                variant="ghost"
                size="xs"
                @click="copyDaySummary(group)"
              />
              <template #content>
                <div class="px-2 py-1 text-xs">
                  Copied!
                </div>
              </template>
            </UPopover>
            <template
              v-for="(badge, i) in summaryBadgesForDay(group.date, group.entries)"
              :key="i"
            >
              <UPopover v-if="badge.icon">
                <UBadge
                  :color="badge.primary ? 'primary' : 'neutral'"
                  variant="subtle"
                  class="cursor-pointer"
                >
                  <UIcon
                    :name="badge.icon"
                    class="size-3.5"
                  />
                  {{ badge.duration }}
                </UBadge>
                <template #content>
                  <div
                    class="flex items-center gap-1 p-2"
                    @keydown.stop
                  >
                    <USelect
                      :model-value="getThresholdHours(group.date)"
                      :items="thresholdHourOptions"
                      class="w-20"
                      size="sm"
                      @update:model-value="setThresholdHours(group.date, $event)"
                    />
                    <span class="text-sm font-mono font-bold">:</span>
                    <USelect
                      :model-value="getThresholdMinutes(group.date)"
                      :items="thresholdMinuteOptions"
                      class="w-20"
                      size="sm"
                      @update:model-value="setThresholdMinutes(group.date, $event)"
                    />
                  </div>
                </template>
              </UPopover>
              <UBadge
                v-else
                color="neutral"
                variant="subtle"
              >
                <template v-if="badge.label">{{ badge.label }}:</template>
                {{ badge.duration }}
              </UBadge>
            </template>
          </div>
          <div class="space-y-2">
            <div
              v-for="(entry, index) in finalizeForDay(group.entries)"
              :key="index"
              class="flex items-center gap-3 rounded-lg border border-default bg-default/50 px-4 py-3"
            >
              <span class="font-mono text-lg font-bold text-primary min-w-[5ch]">{{ entry.duration }}</span>
              <USeparator
                orientation="vertical"
                class="h-6"
              />
              <div class="flex flex-col flex-1">
                <span class="font-semibold text-sm">{{ entry.category }}</span>
                <span
                  v-if="entry.content"
                  class="text-sm text-muted"
                >{{ entry.content }}</span>
              </div>
              <UPopover :open="copiedId === `finalized-${group.date}-${index}`">
                <UButton
                  icon="i-lucide-copy"
                  color="neutral"
                  variant="ghost"
                  size="xs"
                  @click="copyFinalizedRecord(entry, index)"
                />
                <template #content>
                  <div class="px-2 py-1 text-xs">
                    Copied!
                  </div>
                </template>
              </UPopover>
            </div>
          </div>
        </div>
      </div>

      <div v-else>
        <div
          v-for="group in entriesByDate"
          :key="group.date"
          class="mb-8"
        >
          <div class="flex items-center gap-2 mb-4">
            <h1 class="text-2xl font-bold">
              {{ group.label }}
            </h1>
            <UPopover :open="copiedId === `day-${group.date}`">
              <UButton
                icon="i-lucide-copy"
                color="neutral"
                variant="ghost"
                size="xs"
                @click="copyDayRecords(group)"
              />
              <template #content>
                <div class="px-2 py-1 text-xs">
                  Copied!
                </div>
              </template>
            </UPopover>
            <template
              v-for="(badge, i) in recordBadges(group.date, group.entries)"
              :key="i"
            >
              <UPopover v-if="badge.icon">
                <UBadge
                  :color="badge.primary ? 'primary' : 'neutral'"
                  variant="subtle"
                  class="cursor-pointer"
                >
                  <UIcon
                    :name="badge.icon"
                    class="size-3.5"
                  />
                  {{ badge.duration }}
                </UBadge>
                <template #content>
                  <div
                    class="flex items-center gap-1 p-2"
                    @keydown.stop
                  >
                    <USelect
                      :model-value="getThresholdHours(group.date)"
                      :items="thresholdHourOptions"
                      class="w-20"
                      size="sm"
                      @update:model-value="setThresholdHours(group.date, $event)"
                    />
                    <span class="text-sm font-mono font-bold">:</span>
                    <USelect
                      :model-value="getThresholdMinutes(group.date)"
                      :items="thresholdMinuteOptions"
                      class="w-20"
                      size="sm"
                      @update:model-value="setThresholdMinutes(group.date, $event)"
                    />
                  </div>
                </template>
              </UPopover>
              <UBadge
                v-else
                color="neutral"
                variant="subtle"
              >
                <template v-if="badge.label">{{ badge.label }}:</template>
                {{ badge.duration }}
              </UBadge>
            </template>
          </div>

          <VueDraggable
            :model-value="group.entries"
            handle=".drag-handle"
            :animation="200"
            :force-fallback="true"
            fallback-class="!hidden"
            class="space-y-2"
            ghost-class="opacity-50"
            @end="onDragEnd($event, group.date)"
          >
            <div
              v-for="(entry, index) in group.entries"
              :key="entry.id"
              class="relative flex items-center gap-3 rounded-lg border px-4 py-3 select-none"
              :class="!entry.endTime ? 'border-primary/50 bg-primary/5' : 'border-default bg-default/50'"
            >
              <div class="drag-handle cursor-grab active:cursor-grabbing flex items-center text-muted hover:text-foreground transition-colors">
                <UIcon
                  name="i-lucide-grip-vertical"
                  class="size-4"
                />
              </div>
              <div class="flex flex-col items-center font-mono min-w-[5ch]">
                <TimePicker v-model="entry.startTime" />
                <TimePicker
                  v-if="entry.endTime"
                  v-model="entry.endTime"
                />
                <span
                  v-else
                  class="text-xs font-bold text-primary"
                >{{ clockHours }}<span :class="colonVisible ? 'opacity-100' : 'opacity-0'">:</span>{{ clockMinutes }}</span>
              </div>
              <USeparator
                orientation="vertical"
                class="h-6"
              />
              <div class="flex flex-col flex-1">
                <!-- Category: in-progress keyboard input -->
                <template v-if="isActiveEntry(entry)">
                  <span
                    v-if="editingField === 'category'"
                    class="font-semibold text-sm flex items-center gap-1"
                  >{{ entry.category }}<span
                     v-if="suggestions.length > 0"
                     class="text-muted/40"
                   >{{ suggestions[selectedSuggestionIndex]?.slice(entry.category.length) }}</span><span class="animate-pulse text-primary">▎</span>
                    <div
                      v-if="suggestions.length > 1"
                      class="absolute left-[8ch] top-full z-10 mt-1 rounded-lg border border-default bg-default shadow-lg py-1"
                    >
                      <div
                        v-for="(s, i) in suggestions"
                        :key="s"
                        class="px-3 py-1.5 text-sm cursor-default"
                        :class="i === selectedSuggestionIndex ? 'bg-primary/10 text-primary font-medium' : 'text-muted'"
                      >
                        {{ s }}
                      </div>
                    </div>
                  </span>
                  <span
                    v-else-if="entry.category"
                    class="font-semibold text-sm flex items-center gap-1"
                  >{{ entry.category }}</span>
                  <span
                    v-if="editingField === 'content'"
                    class="text-sm text-muted"
                  >{{ entry.content }}<span class="animate-pulse text-primary">▎</span></span>
                  <span
                    v-else-if="entry.content"
                    class="text-sm text-muted"
                  >{{ entry.content }}</span>
                </template>
                <!-- Completed entries: always-visible inputs -->
                <template v-else>
                  <div class="flex items-center gap-1">
                    <UInput
                      v-model="entry.category"
                      variant="none"
                      size="md"
                      class="font-semibold"
                      :ui="{ base: 'px-0 py-0' }"
                      @keydown.stop
                    />
                  </div>
                  <UInput
                    v-model="entry.content"
                    variant="none"
                    size="md"
                    :ui="{ base: 'px-0 py-0 text-muted' }"
                    @keydown.stop
                  />
                </template>
              </div>
              <div class="flex items-center gap-0.5">
                <UPopover :open="copiedId === `record-${index}`">
                  <UButton
                    icon="i-lucide-copy"
                    color="neutral"
                    variant="ghost"
                    size="xs"
                    @click="copyRecord(entry, index)"
                  />
                  <template #content>
                    <div class="px-2 py-1 text-xs">
                      Copied!
                    </div>
                  </template>
                </UPopover>
                <UButton
                  v-if="entry.endTime"
                  icon="i-lucide-trash-2"
                  color="neutral"
                  variant="ghost"
                  size="xs"
                  @click="deleteEntry(entry)"
                />
              </div>
            </div>
          </VueDraggable>
          <div
            v-if="group.entries.some(e => !e.endTime) && !isStopped"
            class="flex justify-end mt-2"
          >
            <UButton
              label="Stop Working"
              color="warning"
              variant="subtle"
              icon="i-lucide-square"
              @click="stopWorking"
            />
          </div>
          <div
            v-if="isStopped && group === entriesByDate[0] && group.date === currentDateStr()"
            class="flex justify-end mt-2"
          >
            <UButton
              label="Continue Work"
              color="primary"
              variant="subtle"
              icon="i-lucide-play"
              @click="continueWorking"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
