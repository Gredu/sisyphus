<script setup lang="ts">
import type { Badge, FinalizedEntry } from '~/composables/useWorkEntries'
import { VueDraggable } from 'vue-draggable-plus'

const { isWorking, isStopped, isFinalized, currentView, entries, loadEntries, startNowTimer, stopNowTimer, showHotkeys, editingField, editingIndex, threshold, roundOrder, collapse, joinCharacter, defaultPrimaryThreshold, today, getActiveEntry, closeAllActive, stopWorking, continueWorking, startOver } = useWorkEntries()
type TimeEntry = typeof entries.value[number]
const selectedSuggestionIndex = ref(0)

const primaryThresholds = ref<Record<string, number>>({})

function getThreshold(date: string): number {
  return primaryThresholds.value[date] ?? defaultPrimaryThreshold.value
}

function setThreshold(date: string, minutes: number) {
  primaryThresholds.value[date] = minutes
}

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

function groupByDate(items: typeof entries.value): Map<string, typeof entries.value> {
  const groups = new Map<string, typeof entries.value>()
  for (const entry of items) {
    const date = entry.date || '1970-01-01'
    if (!groups.has(date)) groups.set(date, [])
    groups.get(date)!.push(entry)
  }
  return groups
}

const entriesByDate = computed<DayGroup[]>(() => {
  return [...groupByDate(entries.value).entries()]
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([date, dayEntries]) => ({
      date,
      label: displayDate(date),
      entries: dayEntries
    }))
})

function nowTime(): string {
  return `${clockHours.value}:${clockMinutes.value}`
}

function groupInterval(): number {
  return threshold.value !== 'none' ? Number(threshold.value) : 0
}

function groupForDay(dayEntries: typeof entries.value) {
  return groupEntries(dayEntries, nowTime(), { roundInterval: groupInterval(), collapse: collapse.value, roundOrder: roundOrder.value })
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
  const badges: Badge[] = [{ icon: 'i-lucide-sigma', duration: formatDuration(totalMinutes), primary: compareTotal >= getThreshold(date) }]
  for (const [name, minutes] of excluded) {
    badges.push({ label: name, duration: formatDuration(minutes) })
  }
  return badges
}

function finalizeForDay(dayEntries: typeof entries.value): FinalizedEntry[] {
  return groupForDay(dayEntries).map(g => ({
    duration: formatDuration(g.minutes),
    category: g.category,
    content: g.contents.join(joinCharacter.value + ' ')
  }))
}

function summaryBadgesForDay(date: string, dayEntries: typeof entries.value): Badge[] {
  return buildBadges(date, groupForDay(dayEntries))
}

function computeRoundedTotal(dayEntries: typeof entries.value): number {
  return groupForDay(dayEntries)
    .filter(g => !g.category.startsWith('!'))
    .reduce((sum, g) => sum + g.minutes, 0)
}

function recordBadges(date: string, dayEntries: typeof entries.value): Badge[] {
  const includable = dayEntries.filter(e => e.endTime || e.category || e.content)
  return buildBadges(date, includable.map((e) => {
    const minutes = calcMinutes(e.startTime, e.endTime || nowTime())
    return { category: e.category, minutes }
  }), computeRoundedTotal(dayEntries))
}

// Calendar view
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
  if (currentView.value !== 'calendar') return []
  const year = calendarMonth.value.getFullYear()
  const month = calendarMonth.value.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)

  // Monday = 0, Sunday = 6
  const startDow = (firstDay.getDay() + 6) % 7
  const days: CalendarDay[] = []

  // Build entries lookup by date
  const byDate = groupByDate(entries.value)

  // Fill leading days from previous month
  for (let i = startDow - 1; i >= 0; i--) {
    const d = new Date(year, month, -i)
    days.push({ date: formatDate(d), day: d.getDate(), isCurrentMonth: false, total: null, totalPrimary: false, categories: [] })
  }

  // Current month days
  for (let d = 1; d <= lastDay.getDate(); d++) {
    const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`
    const dayEntries = byDate.get(dateStr)
    if (!dayEntries || dayEntries.length === 0) {
      days.push({ date: dateStr, day: d, isCurrentMonth: true, total: null, totalPrimary: false, categories: [] })
      continue
    }

    // Calendar cells always show one line per category regardless of the global
    // "collapse" setting (space is tight) — when collapse is off, rounding still
    // happens per-entry before summing, i.e. the same as roundOrder 'before'.
    const grouped = groupEntries(dayEntries, nowTime(), {
      roundInterval: groupInterval(),
      collapse: true,
      roundOrder: collapse.value ? roundOrder.value : 'before'
    })
    const totalMinutes = grouped.filter(g => !g.category.startsWith('!')).reduce((sum, g) => sum + g.minutes, 0)
    const categories = grouped.map(g => ({ name: g.category, duration: formatDuration(g.minutes) }))

    days.push({
      date: dateStr,
      day: d,
      isCurrentMonth: true,
      total: totalMinutes > 0 ? formatDuration(totalMinutes) : null,
      totalPrimary: totalMinutes >= getThreshold(dateStr),
      categories
    })
  }

  // Fill trailing days to complete the grid (6 rows)
  const remaining = 42 - days.length
  for (let i = 1; i <= remaining; i++) {
    const d = new Date(year, month + 1, i)
    days.push({ date: formatDate(d), day: d.getDate(), isCurrentMonth: false, total: null, totalPrimary: false, categories: [] })
  }

  return days
})

const weekDayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const categoryDraft = ref('')
const contentDraft = ref('')

function syncDraftsFromEntry() {
  const current = getActiveEntry()
  if (current) {
    categoryDraft.value = current.category
    contentDraft.value = current.content
  }
}

function syncDraftsToEntry() {
  const current = getActiveEntry()
  if (current) {
    current.category = categoryDraft.value
    current.content = contentDraft.value
  }
}

const knownCategories = computed(() => {
  const cats = new Set<string>()
  for (const entry of entries.value) {
    if (entry.category) cats.add(entry.category)
  }
  return [...cats]
})

const suggestions = computed(() => {
  if (editingField.value !== 'category' || !categoryDraft.value) return []
  const lower = categoryDraft.value.toLowerCase()
  return knownCategories.value.filter(
    c => c.toLowerCase().startsWith(lower) && c.toLowerCase() !== lower
  )
})

watch(suggestions, () => {
  selectedSuggestionIndex.value = 0
})

function acceptSuggestion() {
  if (!categoryDraft.value) return
  if (suggestions.value.length > 0) {
    categoryDraft.value = suggestions.value[selectedSuggestionIndex.value]!
  }
  syncDraftsToEntry()
  selectedSuggestionIndex.value = 0
  editingField.value = 'content'
}

function selectSuggestion(index: number) {
  selectedSuggestionIndex.value = index
  acceptSuggestion()
}

function startNewEntry() {
  const d = new Date()
  const now = formatTime(d)

  closeAllActive(now)
  isWorking.value = true
  entries.value.push({ id: crypto.randomUUID(), date: today.value, startTime: now, endTime: null, category: '', content: '' })
  editingField.value = 'category'
  categoryDraft.value = ''
  contentDraft.value = ''
  selectedSuggestionIndex.value = 0
  focusActiveField()
}

function isActiveEntry(entry: TimeEntry): boolean {
  return !entry.endTime && editingIndex.value === null && !isStopped.value
}

const activeCategoryRef = ref<HTMLInputElement | HTMLInputElement[] | null>(null)
const activeContentRef = ref<HTMLInputElement | HTMLInputElement[] | null>(null)

function getInputEl(r: HTMLInputElement | HTMLInputElement[] | null): HTMLInputElement | undefined {
  if (!r) return undefined
  return Array.isArray(r) ? r[0] : r
}

function focusActiveField() {
  nextTick(() => {
    if (editingField.value === 'category') {
      getInputEl(activeCategoryRef.value)?.focus()
    } else {
      getInputEl(activeContentRef.value)?.focus()
    }
  })
}

watch(editingField, () => focusActiveField())

watch(isStopped, (stopped) => {
  if (!stopped) {
    syncDraftsFromEntry()
    focusActiveField()
  }
})

function handleActiveCategoryKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter') {
    event.preventDefault()
    if (!categoryDraft.value) return
    syncDraftsToEntry()
    editingField.value = 'content'
    selectedSuggestionIndex.value = 0
    return
  }

  if (event.key === 'Tab') {
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

  if (event.key === 'Backspace' && categoryDraft.value.length === 0) {
    event.preventDefault()
    const current = getActiveEntry()
    if (!current) return
    const todayEntries = entries.value.filter(e => e.date === current.date)
    if (todayEntries.length <= 1) return
    const activeIdx = entries.value.indexOf(current)
    if (activeIdx !== -1) entries.value.splice(activeIdx, 1)
    const previous = entries.value.filter(e => e.date === current.date).pop()
    if (previous) {
      previous.endTime = null
      editingField.value = previous.content ? 'content' : 'category'
      syncDraftsFromEntry()
      focusActiveField()
    }
  }
}

function handleActiveContentKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter') {
    event.preventDefault()
    if (!categoryDraft.value) return
    syncDraftsToEntry()
    startNewEntry()
    return
  }

  if (event.key === 'Backspace' && contentDraft.value.length === 0) {
    event.preventDefault()
    editingField.value = 'category'
  }
}

function handleKeydown(event: KeyboardEvent) {
  if (editingIndex.value !== null) return
  if (isStopped.value || isFinalized.value) return
  // Only handle Enter when no active input is focused (e.g. starting first entry)
  if (event.key === 'Enter' && !isWorking.value) {
    event.preventDefault()
    startNewEntry()
  }
}

function deleteEntry(entry: TimeEntry) {
  const idx = entries.value.indexOf(entry)
  if (idx === -1) return
  const wasActive = !entry.endTime
  if (wasActive) {
    const todayEntries = entries.value.filter(e => e.date === entry.date)
    if (todayEntries.length <= 1) return
  }
  entries.value.splice(idx, 1)
  if (entries.value.length === 0) {
    startOver()
    return
  }
  if (wasActive) {
    const sameDayLast = entries.value.filter(e => e.date === entry.date).pop()
    if (sameDayLast) sameDayLast.endTime = null
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

let audioCtx: AudioContext | null = null
function playThresholdSound() {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    if (audioCtx.state === 'suspended') audioCtx.resume()
    const ctx = audioCtx
    const start = ctx.currentTime
    const notes = [{ freq: 523.25, at: 0 }, { freq: 659.25, at: 0.13 }, { freq: 783.99, at: 0.26 }]
    for (const note of notes) {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = note.freq
      osc.connect(gain)
      gain.connect(ctx.destination)
      const t = start + note.at
      gain.gain.setValueAtTime(0, t)
      gain.gain.linearRampToValueAtTime(0.18, t + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5)
      osc.start(t)
      osc.stop(t + 0.5)
    }
  } catch {
    // audio unavailable — ignore
  }
}

let thresholdInitialized = false
let prevThresholdMet = new Set<string>()
watchEffect(() => {
  const met = new Set<string>()
  for (const group of entriesByDate.value) {
    if (computeRoundedTotal(group.entries) >= getThreshold(group.date)) met.add(group.date)
  }
  if (thresholdInitialized) {
    for (const date of met) {
      if (!prevThresholdMet.has(date)) {
        playThresholdSound()
        break
      }
    }
  }
  prevThresholdMet = met
  thresholdInitialized = true
})

let saveTimeout: ReturnType<typeof setTimeout>
watch(entries, () => {
  clearTimeout(saveTimeout)
  saveTimeout = setTimeout(() => {
    localStorage.setItem('sisyphus-entries', JSON.stringify(entries.value))
  }, 300)
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

const defaultTitle = 'Sisyphus'
const pageTitle = computed(() => {
  const active = getActiveEntry()
  if (!active) return defaultTitle
  // depend on currentTime so this re-runs every tick
  const now = currentTime.value
  const nowTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
  const todayEntries = entries.value.filter(e => e.date === active.date && (e.endTime || e.category || e.content))
  let totalMinutes = 0
  for (const e of todayEntries) {
    if (e.category.startsWith('!')) continue
    totalMinutes += calcMinutes(e.startTime, e.endTime || nowTime)
  }
  const h = Math.floor(Math.max(0, totalMinutes) / 60).toString().padStart(2, '0')
  const m = (Math.max(0, totalMinutes) % 60).toString().padStart(2, '0')
  return `${h}:${m} — ${defaultTitle}`
})
useHead({ title: pageTitle })

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
  if (getActiveEntry()) {
    syncDraftsFromEntry()
    focusActiveField()
  }
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
            <span class="text-muted">Accept category as-is and move to content</span>
            <kbd class="font-mono text-xs bg-default border border-default rounded px-1.5 py-0.5">Tab</kbd>
            <span class="text-muted">Autocomplete suggestion / cycle through suggestions</span>
            <kbd class="font-mono text-xs bg-default border border-default rounded px-1.5 py-0.5">Shift+Tab</kbd>
            <span class="text-muted">Cycle suggestions in reverse</span>
            <kbd class="font-mono text-xs bg-default border border-default rounded px-1.5 py-0.5">Backspace</kbd>
            <span class="text-muted">Delete character / go back to previous entry</span>
            <kbd class="font-mono text-xs bg-default border border-default rounded px-1.5 py-0.5">A-Z, 0-9, Space</kbd>
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
                  <ThresholdInput
                    :model-value="getThreshold(day.date)"
                    @update:model-value="setThreshold(day.date, $event)"
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
            <CopyButton
              :copied="copiedId === `day-${group.date}`"
              @click="copyDaySummary(group)"
            />
            <DayBadges
              :badges="summaryBadgesForDay(group.date, group.entries)"
              :threshold="getThreshold(group.date)"
              @update:threshold="setThreshold(group.date, $event)"
            />
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
              <CopyButton
                :copied="copiedId === `finalized-${group.date}-${index}`"
                @click="copyFinalizedRecord(entry, index)"
              />
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
            <CopyButton
              :copied="copiedId === `day-${group.date}`"
              @click="copyDayRecords(group)"
            />
            <DayBadges
              :badges="recordBadges(group.date, group.entries)"
              :threshold="getThreshold(group.date)"
              @update:threshold="setThreshold(group.date, $event)"
            />
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
                <TimePicker
                  v-model="entry.startTime"
                  :quick-set="index > 0 ? group.entries[index - 1]?.endTime ?? undefined : undefined"
                  quick-set-label="Prev end"
                />
                <TimePicker
                  v-if="entry.endTime"
                  v-model="entry.endTime"
                  :quick-set="index < group.entries.length - 1 ? group.entries[index + 1]?.startTime ?? undefined : undefined"
                  quick-set-label="Next start"
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
                <template v-if="isActiveEntry(entry)">
                  <div class="relative flex items-center gap-1">
                    <input
                      ref="activeCategoryRef"
                      v-model="categoryDraft"
                      class="bg-transparent outline-none font-semibold text-sm w-full"
                      placeholder="Category"
                      @keydown="handleActiveCategoryKeydown"
                      @focus="editingField = 'category'"
                      @blur="syncDraftsToEntry()"
                    >
                    <span
                      v-if="editingField === 'category' && suggestions.length > 0"
                      class="absolute left-0 pointer-events-none font-semibold text-sm text-muted/40"
                    >{{ categoryDraft }}{{ suggestions[selectedSuggestionIndex]?.slice(categoryDraft.length) }}</span>
                    <div
                      v-if="editingField === 'category' && suggestions.length > 1"
                      class="absolute left-0 top-full z-10 mt-1 rounded-lg border border-default bg-default shadow-lg py-1"
                    >
                      <div
                        v-for="(s, i) in suggestions"
                        :key="s"
                        class="px-3 py-1.5 text-sm cursor-pointer hover:bg-primary/10 hover:text-primary"
                        :class="i === selectedSuggestionIndex ? 'bg-primary/10 text-primary font-medium' : 'text-muted'"
                        @mousedown.prevent="selectSuggestion(i)"
                      >
                        {{ s }}
                      </div>
                    </div>
                  </div>
                  <input
                    ref="activeContentRef"
                    v-model="contentDraft"
                    class="bg-transparent outline-none text-sm text-muted w-full"
                    placeholder="Content"
                    @keydown="handleActiveContentKeydown"
                    @focus="editingField = 'content'"
                    @blur="syncDraftsToEntry()"
                  >
                </template>
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
                <CopyButton
                  :copied="copiedId === `record-${index}`"
                  @click="copyRecord(entry, index)"
                />
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
            v-if="isStopped && group === entriesByDate[0] && group.date === today"
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
