<script setup lang="ts">
const modelValue = defineModel<number>({ required: true })

const hours = computed(() => Math.floor(modelValue.value / 60).toString().padStart(2, '0'))
const minutes = computed(() => (modelValue.value % 60).toString().padStart(2, '0'))

function setHours(h: string) {
  modelValue.value = Number(h) * 60 + (modelValue.value % 60)
}

function setMinutes(m: string) {
  modelValue.value = Math.floor(modelValue.value / 60) * 60 + Number(m)
}

const hourOptions = Array.from({ length: 24 }, (_, i) => ({
  label: i.toString().padStart(2, '0'),
  value: i.toString().padStart(2, '0')
}))
const minuteOptions = Array.from({ length: 60 }, (_, i) => ({
  label: i.toString().padStart(2, '0'),
  value: i.toString().padStart(2, '0')
}))
</script>

<template>
  <div class="flex items-center gap-1">
    <USelect
      :model-value="hours"
      :items="hourOptions"
      class="w-20"
      size="sm"
      @update:model-value="setHours($event)"
    />
    <span class="text-sm font-mono font-bold">:</span>
    <USelect
      :model-value="minutes"
      :items="minuteOptions"
      class="w-20"
      size="sm"
      @update:model-value="setMinutes($event)"
    />
  </div>
</template>
