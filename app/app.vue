<script setup lang="ts">
const { isWorking, isStopped, entries, threshold, currentView, collapse, joinCharacter, roundOrder, showHotkeys, defaultPrimaryThreshold, continueWorking, startOver } = useWorkEntries()

const defaultThresholdHours = computed({
  get: () => Math.floor(defaultPrimaryThreshold.value / 60).toString().padStart(2, '0'),
  set: (v: string) => { defaultPrimaryThreshold.value = Number(v) * 60 + (defaultPrimaryThreshold.value % 60) }
})
const defaultThresholdMinutes = computed({
  get: () => (defaultPrimaryThreshold.value % 60).toString().padStart(2, '0'),
  set: (v: string) => { defaultPrimaryThreshold.value = Math.floor(defaultPrimaryThreshold.value / 60) * 60 + Number(v) }
})
const thresholdHourOptions = Array.from({ length: 24 }, (_, i) => ({
  label: i.toString().padStart(2, '0'),
  value: i.toString().padStart(2, '0')
}))
const thresholdMinuteOptions = Array.from({ length: 60 }, (_, i) => ({
  label: i.toString().padStart(2, '0'),
  value: i.toString().padStart(2, '0')
}))

const wouldCreateNewDate = computed(() => {
  if (entries.value.length === 0) return !isWorking.value
  if (!isStopped.value) return false
  const today = new Date().toISOString().split('T')[0]
  const lastDate = entries.value[entries.value.length - 1]?.date
  return lastDate !== today
})

const configOpen = ref(false)
const confirmOpen = ref(false)

const roundOrderOptions = [
  { label: 'Round after grouping', value: 'after' },
  { label: 'Round before grouping', value: 'before' }
]

const roundUpOptions = [
  { label: 'None', value: 'none' },
  { label: '10 minutes', value: '10' },
  { label: '15 minutes', value: '15' },
  { label: '20 minutes', value: '20' },
  { label: '30 minutes', value: '30' }
]
</script>

<template>
  <UApp>
    <div class="flex flex-col min-h-screen">
      <header class="border-b border-default">
        <div class="flex items-center justify-between mx-auto px-4 py-2">
          <div class="flex items-center gap-4">
            <div class="flex items-center gap-2.5 group cursor-default">
              <h1 class="text-lg font-bold tracking-tight">
                Sisyphus
              </h1>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <UFieldGroup>
              <UTooltip text="Calendar View">
                <UButton
                  icon="i-lucide-calendar"
                  color="neutral"
                  label="Calendar"
                  :variant="currentView === 'calendar' ? 'subtle' : 'outline'"
                  @click="currentView = 'calendar'"
                />
              </UTooltip>
              <UTooltip text="Summarize View">
                <UButton
                  icon="i-lucide-pie-chart"
                  color="neutral"
                  label="Summary"
                  :variant="currentView === 'summary' ? 'subtle' : 'outline'"
                  @click="currentView = 'summary'"
                />
              </UTooltip>
              <UTooltip text="Record View">
                <UButton
                  icon="i-lucide-timer"
                  color="neutral"
                  label="Record"
                  :variant="currentView === 'record' ? 'subtle' : 'outline'"
                  @click="currentView = 'record'"
                />
              </UTooltip>
            </UFieldGroup>
          </div>

          <div class="flex items-center gap-2">
            <UButton
              v-if="wouldCreateNewDate"
              label="Start Work"
              color="primary"
              variant="subtle"
              icon="i-lucide-play"
              @click="continueWorking"
            />
            <UTooltip text="Settings">
              <UButton
                icon="i-lucide-settings"
                color="neutral"
                variant="outline"
                @click="configOpen = true"
              />
            </UTooltip>
          </div>
        </div>
      </header>

      <main class="flex-1 max-w-5xl mx-auto w-full px-4">
        <NuxtPage />
      </main>
    </div>

    <USlideover
      v-model:open="configOpen"
      title="View Configurations"
      description="Adjust your preferences for different views and behaviors."
    >
      <template #body>
        <div class="flex flex-col gap-6 px-2 py-3">
          <!-- General -->
          <div class="flex flex-col gap-5 rounded-lg border border-default bg-default/30 p-4">
            <h3 class="text-sm font-bold flex items-center gap-2">
              <UIcon
                name="i-lucide-settings"
                class="size-4 text-primary"
              />
              General
            </h3>

            <div class="flex items-start justify-between gap-4">
              <div class="flex flex-col gap-1">
                <p class="text-sm font-semibold">
                  Show hotkeys
                </p>
                <p class="text-xs text-muted leading-relaxed">
                  Display available keyboard shortcuts in the Record View.
                </p>
              </div>
              <USwitch v-model="showHotkeys" />
            </div>

            <div class="flex items-start justify-between gap-4">
              <div class="flex flex-col gap-1">
                <p class="text-sm font-semibold">
                  Daily hours target
                </p>
                <p class="text-xs text-muted leading-relaxed">
                  Default threshold for highlighting when a day's total reaches this amount.
                </p>
              </div>
              <div class="flex items-center gap-1">
                <USelect
                  v-model="defaultThresholdHours"
                  :items="thresholdHourOptions"
                  class="w-20"
                  size="sm"
                />
                <span class="text-sm font-mono font-bold">:</span>
                <USelect
                  v-model="defaultThresholdMinutes"
                  :items="thresholdMinuteOptions"
                  class="w-20"
                  size="sm"
                />
              </div>
            </div>
          </div>

          <!-- Summarize View Settings Group -->
          <div class="flex flex-col gap-5 rounded-lg border border-default bg-default/30 p-4">
            <h3 class="text-sm font-bold flex items-center gap-2">
              <UIcon
                name="i-lucide-pie-chart"
                class="size-4 text-primary"
              />
              Summarize View
            </h3>

            <div class="flex flex-col gap-10">
              <!-- Rounding Section -->
              <section class="flex flex-col gap-4">
                <div class="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted">
                  <UIcon
                    name="i-lucide-clock"
                    class="size-4 text-primary"
                  />
                  Rounding
                </div>

                <div class="flex flex-col gap-6 pl-5 border-l border-default/50">
                  <div class="flex flex-col gap-2">
                    <label class="text-sm font-semibold">Round up to nearest</label>
                    <USelect
                      v-model="threshold"
                      :items="roundUpOptions"
                      class="w-full max-w-[200px]"
                    />
                  </div>

                  <div
                    v-if="threshold !== 'none' && collapse"
                    class="flex flex-col gap-3"
                  >
                    <label class="text-sm font-semibold">When to round</label>
                    <URadioGroup
                      v-model="roundOrder"
                      :items="roundOrderOptions"
                    />
                  </div>
                </div>
              </section>

              <!-- Grouping Section -->
              <section class="flex flex-col gap-4">
                <div class="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted">
                  <UIcon
                    name="i-lucide-layers"
                    class="size-4 text-primary"
                  />
                  Grouping
                </div>

                <div class="flex flex-col gap-6 pl-5 border-l border-default/50">
                  <div class="flex items-start justify-between gap-4">
                    <div class="flex flex-col gap-1">
                      <p class="text-sm font-semibold">
                        Collapse by category
                      </p>
                      <p class="text-xs text-muted leading-relaxed">
                        Merge multiple entries with the same category into one.
                      </p>
                    </div>
                    <USwitch v-model="collapse" />
                  </div>

                  <div
                    v-if="collapse"
                    class="flex flex-col gap-2"
                  >
                    <label class="text-sm font-semibold">Content join character</label>
                    <p class="text-xs text-muted leading-relaxed">
                      Character used to separate notes when entries are collapsed.
                    </p>
                    <UInput
                      v-model="joinCharacter"
                      class="max-w-[80px]"
                    />
                  </div>
                </div>
              </section>
            </div>
          </div>

          <!-- Danger Zone -->
          <div class="flex flex-col gap-5 rounded-lg border border-error/30 bg-error/5 p-4">
            <h3 class="text-sm font-bold flex items-center gap-2 text-error">
              <UIcon
                name="i-lucide-triangle-alert"
                class="size-4"
              />
              Danger Zone
            </h3>

            <UButton
              label="Delete all data"
              color="error"
              variant="subtle"
              icon="i-lucide-trash"
              @click="confirmOpen = true"
            />
          </div>
        </div>
      </template>
    </USlideover>

    <UModal v-model:open="confirmOpen">
      <template #content>
        <div class="p-6 flex flex-col gap-4">
          <div class="flex items-center gap-2">
            <UIcon
              name="i-lucide-triangle-alert"
              class="size-5 text-error"
            />
            <h3 class="text-lg font-bold">
              Delete all data?
            </h3>
          </div>
          <p class="text-sm text-muted">
            This will permanently remove all your recorded entries. This action cannot be undone.
          </p>
          <div class="flex justify-end gap-2 mt-2">
            <UButton
              label="Cancel"
              color="neutral"
              variant="outline"
              @click="confirmOpen = false"
            />
            <UButton
              label="Delete All"
              color="error"
              icon="i-lucide-trash"
              @click="startOver(); confirmOpen = false; configOpen = false"
            />
          </div>
        </div>
      </template>
    </UModal>
  </UApp>
</template>
