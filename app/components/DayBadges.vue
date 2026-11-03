<script setup lang="ts">
import type { Badge } from '~/composables/useWorkEntries'

defineProps<{
  badges: Badge[]
  threshold: number
}>()

defineEmits<{
  'update:threshold': [minutes: number]
}>()
</script>

<template>
  <template
    v-for="(badge, i) in badges"
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
          <ThresholdInput
            :model-value="threshold"
            @update:model-value="$emit('update:threshold', $event)"
          />
        </div>
      </template>
    </UPopover>
    <UBadge
      v-else
      color="neutral"
      variant="subtle"
    >
      <template v-if="badge.label">
        {{ badge.label }}:
      </template>
      {{ badge.duration }}
    </UBadge>
  </template>
</template>
