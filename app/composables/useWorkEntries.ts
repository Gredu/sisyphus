export interface TimeEntry {
  id: string
  date: string
  startTime: string
  endTime: string | null
  category: string
  content: string
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]
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
const editingField = ref<'category' | 'content'>('category')
const editingIndex = ref<number | null>(null)


export interface FinalizedEntry {
  duration: string
  category: string
  content: string
}

function calcMinutes(start: string, end: string): number {
  const [sh, sm] = start.split(':').map(Number)
  const [eh, em] = end.split(':').map(Number)
  return (eh * 60 + em) - (sh * 60 + sm)
}

function roundUp(minutes: number, interval: number): number {
  return Math.ceil(minutes / interval) * interval
}

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60).toString().padStart(2, '0')
  const m = (minutes % 60).toString().padStart(2, '0')
  return `${h}:${m}`
}

const now = ref(formatTime(new Date()))
let nowInterval: ReturnType<typeof setInterval>

function startNowTimer() {
  nowInterval = setInterval(() => {
    now.value = formatTime(new Date())
  }, 1000)
}

function stopNowTimer() {
  clearInterval(nowInterval)
}

const finalizedEntries = computed<FinalizedEntry[]>(() => {
  const roundInterval = threshold.value !== 'none' ? Number(threshold.value) : 0
  const includable = entries.value.filter(e => e.endTime || e.category || e.content)

  function getEndTime(e: TimeEntry): string {
    return e.endTime || now.value
  }

  if (!collapse.value) {
    return includable.map((e) => {
      let minutes = calcMinutes(e.startTime, getEndTime(e))
      if (roundInterval > 0) minutes = roundUp(minutes, roundInterval)
      return { duration: formatDuration(minutes), category: e.category, content: e.content }
    })
  }

  const grouped = new Map<string, { totalMinutes: number, contents: string[] }>()
  for (const e of includable) {
    let minutes = calcMinutes(e.startTime, getEndTime(e))
    if (roundInterval > 0 && roundOrder.value === 'before') minutes = roundUp(minutes, roundInterval)
    const existing = grouped.get(e.category)
    if (existing) {
      existing.totalMinutes += minutes
      if (e.content && !existing.contents.includes(e.content)) existing.contents.push(e.content)
    } else {
      grouped.set(e.category, { totalMinutes: minutes, contents: e.content ? [e.content] : [] })
    }
  }

  return [...grouped.entries()].map(([category, data]) => {
    let minutes = data.totalMinutes
    if (roundInterval > 0 && roundOrder.value === 'after') minutes = roundUp(minutes, roundInterval)
    return {
      duration: formatDuration(minutes),
      category,
      content: data.contents.join(joinCharacter.value + ' ')
    }
  })
})

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
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

function getActiveEntry(): TimeEntry | null {
  return entries.value.find(e => !e.endTime) ?? null
}

function stopWorking() {
  const active = getActiveEntry()
  if (active) {
    if (!active.category && !active.content) {
      const idx = entries.value.indexOf(active)
      if (idx !== -1) entries.value.splice(idx, 1)
    } else {
      active.endTime = formatTime(new Date())
    }
  }
  isStopped.value = true
  saveEntries()
}

function continueWorking() {
  const d = new Date()
  const timeNow = formatTime(d)
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
    collapse,
    joinCharacter,
    roundOrder,
    finalizedEntries,
    showHotkeys,
    editingField,
    editingIndex,
    startNowTimer,
    stopNowTimer,
    getActiveEntry,
    stopWorking,
    continueWorking,
    startOver
  }
}
