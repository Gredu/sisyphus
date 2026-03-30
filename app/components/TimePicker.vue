<script setup lang="ts">
const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const open = ref(false)

const hour = computed({
  get: () => props.modelValue.split(':')[0] ?? '00',
  set: (v: string) => emit('update:modelValue', `${v}:${minute.value}`)
})

const minute = computed({
  get: () => props.modelValue.split(':')[1] ?? '00',
  set: (v: string) => emit('update:modelValue', `${hour.value}:${v}`)
})

const hours = Array.from({ length: 24 }, (_, i) => ({
  label: i.toString().padStart(2, '0'),
  value: i.toString().padStart(2, '0')
}))

const minutes = Array.from({ length: 60 }, (_, i) => ({
  label: i.toString().padStart(2, '0'),
  value: i.toString().padStart(2, '0')
}))
</script>

<template>
  <UPopover v-model:open="open">
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
        class="flex items-center gap-1 p-2"
        @keydown.stop
      >
        <USelect
          v-model="hour"
          :items="hours"
          class="w-20"
          size="sm"
        />
        <span class="text-sm font-mono font-bold">:</span>
        <USelect
          v-model="minute"
          :items="minutes"
          class="w-20"
          size="sm"
        />
      </div>
    </template>
  </UPopover>
</template>
