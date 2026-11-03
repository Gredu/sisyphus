<script setup lang="ts">
defineProps<{
  copied: boolean
}>()

defineEmits<{
  click: []
}>()
</script>

<template>
  <UPopover :open="copied">
    <UButton
      icon="i-lucide-copy"
      color="neutral"
      variant="ghost"
      size="xs"
      @click="$emit('click')"
    />
    <template #content>
      <div class="px-2 py-1 text-xs">
        Copied!
      </div>
    </template>
  </UPopover>
</template>
