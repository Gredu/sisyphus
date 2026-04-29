<script setup lang="ts">
const props = defineProps<{
  modelValue: string
  quickSet?: string
  quickSetLabel?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const open = ref(false)
const inputRef = ref<HTMLInputElement | null>(null)
const draft = ref('')

function parseAndEmit(value: string) {
  const cleaned = value.replace(/[^0-9]/g, '')
  if (cleaned.length < 3) return false
  const h = parseInt(cleaned.slice(0, 2), 10)
  const m = parseInt(cleaned.slice(2, 4), 10)
  if (h >= 0 && h <= 23 && m >= 0 && m <= 59) {
    emit('update:modelValue', `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`)
    return true
  }
  return false
}

function onOpen() {
  draft.value = props.modelValue
  nextTick(() => {
    inputRef.value?.focus()
    inputRef.value?.select()
  })
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter') {
    event.preventDefault()
    if (parseAndEmit(draft.value)) {
      open.value = false
    }
  } else if (event.key === 'Escape') {
    event.preventDefault()
    open.value = false
  }
}

function onBlur() {
  parseAndEmit(draft.value)
}

function adjustMinutes(delta: number) {
  const [h = 0, m = 0] = props.modelValue.split(':').map(Number)
  let total = h * 60 + m + delta
  if (total < 0) total = 0
  if (total > 23 * 60 + 59) total = 23 * 60 + 59
  const newH = Math.floor(total / 60).toString().padStart(2, '0')
  const newM = (total % 60).toString().padStart(2, '0')
  const newValue = `${newH}:${newM}`
  emit('update:modelValue', newValue)
  draft.value = newValue
}
</script>

<template>
  <UPopover
    v-model:open="open"
    @update:open="$event && onOpen()"
  >
    <UButton
      variant="link"
      color="neutral"
      class="font-mono text-xs text-muted hover:text-primary"
      :ui="{ base: 'px-0 py-0' }"
      @click.stop
    >
      {{ modelValue }}
    </UButton>

    <template #content>
      <div
        class="flex flex-col gap-1 p-2"
        @keydown.stop
      >
        <input
          ref="inputRef"
          v-model="draft"
          class="bg-transparent outline-none font-mono text-sm text-center w-full border border-default rounded px-2 py-1"
          placeholder="HH:MM"
          @keydown="onKeydown"
          @blur="onBlur"
        />
        <div class="flex gap-0.5">
          <UButton
            v-for="delta in [-15, -10, -5, 5, 10, 15]"
            :key="delta"
            :label="(delta > 0 ? '+' : '') + delta"
            variant="soft"
            color="neutral"
            size="xs"
            class="flex-1"
            @click="adjustMinutes(delta)"
          />
        </div>
        <UButton
          v-if="props.quickSet"
          :label="`${quickSetLabel ?? 'Set'} ${quickSet}`"
          variant="soft"
          color="neutral"
          size="xs"
          block
          @click="emit('update:modelValue', quickSet!); open = false"
        />
      </div>
    </template>
  </UPopover>
</template>
