export interface TimeEntry {
  id: string
  date: string
  startTime: string
  endTime: string | null
  category: string
  content: string
}

export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]!
}

const STORAGE_KEY = 'sisyphus-entries'

const isWorking = ref(false)
const isStopped = ref(false)
const entries = ref<TimeEntry[]>([])
const threshold = ref('15')
const currentView = ref<'record' | 'summary' | 'calendar'>('record')
const isFinalized = computed(() => currentView.value === 'summary')
const collapse = ref(true)
const joinCharacter = ref(';')
const roundOrder = ref<'after' | 'before'>('after')
const showHotkeys = ref(false)
const defaultPrimaryThreshold = ref(450)
const editingField = ref<'category' | 'content'>('category')
const editingIndex = ref<number | null>(null)
const timeFormat = ref<'hhmm' | 'decimal'>('decimal')

export interface FinalizedEntry {
  duration: string
  category: string
  content: string
}

export interface Badge {
  icon?: string
  label?: string
  duration: string
  primary?: boolean
}

export function calcMinutes(start: string, end: string): number {
  const [sh = 0, sm = 0] = start.split(':').map(Number)
  const [eh = 0, em = 0] = end.split(':').map(Number)
  return (eh * 60 + em) - (sh * 60 + sm)
}

function roundUp(minutes: number, interval: number): number {
  return Math.ceil(minutes / interval) * interval
}

export function formatDuration(minutes: number): string {
  if (timeFormat.value === 'decimal') {
    return (minutes / 60).toFixed(2)
  }
  const h = Math.floor(minutes / 60).toString().padStart(2, '0')
  const m = (minutes % 60).toString().padStart(2, '0')
  return `${h}:${m}`
}

export interface GroupedEntry {
  category: string
  minutes: number
  contents: string[]
}

export interface GroupOptions {
  roundInterval: number
  collapse: boolean
  roundOrder: 'before' | 'after'
}

// Shared by the live record grouping below, the per-day summary/record views,
// and the calendar cells — all four need "sum minutes per category, honoring
// rounding order" and used to reimplement it separately.
export function groupEntries(items: TimeEntry[], nowTime: string, opts: GroupOptions): GroupedEntry[] {
  const { roundInterval, collapse, roundOrder } = opts
  const includable = items.filter(e => e.endTime || e.category || e.content)

  if (!collapse) {
    return includable.map((e) => {
      let minutes = calcMinutes(e.startTime, e.endTime || nowTime)
      if (roundInterval > 0) minutes = roundUp(minutes, roundInterval)
      return { category: e.category, minutes, contents: e.content ? [e.content] : [] }
    })
  }

  const grouped = new Map<string, GroupedEntry>()
  for (const e of includable) {
    let minutes = calcMinutes(e.startTime, e.endTime || nowTime)
    if (roundInterval > 0 && roundOrder === 'before') minutes = roundUp(minutes, roundInterval)
    const existing = grouped.get(e.category)
    if (existing) {
      existing.minutes += minutes
      if (e.content && !existing.contents.includes(e.content)) existing.contents.push(e.content)
    } else {
      grouped.set(e.category, { category: e.category, minutes, contents: e.content ? [e.content] : [] })
    }
  }

  return [...grouped.values()].map((g) => {
    const minutes = roundInterval > 0 && roundOrder === 'after' ? roundUp(g.minutes, roundInterval) : g.minutes
    return { ...g, minutes }
  })
}

const now = ref(formatTime(new Date()))
const today = ref(formatDate(new Date()))
let nowInterval: ReturnType<typeof setInterval>

function startNowTimer() {
  nowInterval = setInterval(() => {
    now.value = formatTime(new Date())
    today.value = formatDate(new Date())
  }, 1000)
}

function stopNowTimer() {
  clearInterval(nowInterval)
}

function saveEntries() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.value))
}

function loadEntries() {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored) {
    const parsed = JSON.parse(stored) as TimeEntry[]
    entries.value = parsed.map(e => ({ ...e, id: e.id || crypto.randomUUID(), date: e.date || formatDate(new Date()) }))
    isWorking.value = entries.value.length > 0
    isStopped.value = isWorking.value && entries.value.every(e => e.endTime)
  }
  const storedThreshold = localStorage.getItem('sisyphus-default-threshold')
  if (storedThreshold) defaultPrimaryThreshold.value = Number(storedThreshold)
}

watch(defaultPrimaryThreshold, (v) => {
  localStorage.setItem('sisyphus-default-threshold', String(v))
})

export function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

function getActiveEntry(): TimeEntry | null {
  return entries.value.findLast(e => !e.endTime) ?? null
}

function closeAllActive(now: string) {
  for (let i = entries.value.length - 1; i >= 0; i--) {
    const e = entries.value[i]!
    if (e.endTime) continue
    if (!e.category && !e.content) {
      entries.value.splice(i, 1)
    } else {
      e.endTime = now
    }
  }
}

function stopWorking() {
  closeAllActive(formatTime(new Date()))
  isStopped.value = true
  currentView.value = 'summary'
  saveEntries()
}

function continueWorking() {
  const d = new Date()
  const timeNow = formatTime(d)
  closeAllActive(timeNow)
  entries.value.push({ id: crypto.randomUUID(), date: formatDate(d), startTime: timeNow, endTime: null, category: '', content: '' })
  isStopped.value = false
  currentView.value = 'record'
  saveEntries()
}

function startOver() {
  entries.value = []
  isWorking.value = false
  isStopped.value = false
  localStorage.removeItem(STORAGE_KEY)
}

export function useWorkEntries() {
  return {
    isWorking,
    isStopped,
    entries,
    saveEntries,
    loadEntries,
    threshold,
    isFinalized,
    currentView,
    today,
    collapse,
    joinCharacter,
    roundOrder,
    showHotkeys,
    defaultPrimaryThreshold,
    editingField,
    editingIndex,
    timeFormat,
    startNowTimer,
    stopNowTimer,
    getActiveEntry,
    closeAllActive,
    stopWorking,
    continueWorking,
    startOver
  }
}
