# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
bun run dev          # Start dev server (http://localhost:3000)
bun run build        # Production build
bun run lint         # ESLint
bun run typecheck    # vue-tsc type checking (via `nuxt typecheck`)
```

Local dev uses bun (`packageManager: bun` in package.json, `bun.lock`). CI (`.github/workflows/ci.yml`) still installs and runs everything through pnpm — no `pnpm-lock.yaml` is committed, so it resolves fresh. No tests exist.

## Architecture

Nuxt 4 app with Nuxt UI v4, Tailwind v4, and Lucide icons. Theme: green primary, slate neutral (`app/app.config.ts`).

### State Management

All shared state lives in `app/composables/useWorkEntries.ts` as module-level refs (singleton pattern), shared between `app.vue` (header controls, config modal) and `pages/index.vue` (entry UI, keyboard handling). `currentView` is `'record' | 'summary' | 'calendar'` — the calendar view (month grid, navigation) lives entirely in `pages/index.vue`.

### Keyboard-Driven Input

The active entry's `category` and `content` fields are native `<input v-model>` elements in `pages/index.vue` (completed entries use Nuxt UI's `UInput`) — typing is native browser behavior, not programmatic. `editingField` tracks which of the two is focused. Keydown handlers (`handleActiveCategoryKeydown` / `handleActiveContentKeydown`) only intercept specific keys on top of that: `Enter` confirms/advances, `Tab`/`Shift+Tab` cycle autocomplete suggestions, and `Backspace` on an empty field merges back into the previous entry. The `TimePicker.vue` component (start/end time editing) similarly uses a native `<input>` inside a popover, plus quick minute-adjustment buttons.

Keep the hotkeys guide template (the `showHotkeys` block starting around line 715 in `pages/index.vue`) in sync when editing `index.vue`, `useWorkEntries.ts`, or `app.vue` — there's no automated reminder for this, so it's easy to let it drift.

### Data Flow

Entries persist to `localStorage` under `sisyphus-entries` (the `STORAGE_KEY` constant in `useWorkEntries.ts`). Related keys: `sisyphus-default-threshold` (default rounding threshold, in the composable) and `sisyphus-primary-thresholds` (per-category thresholds, set directly in `pages/index.vue`). `groupEntries` (in the composable) is the shared primitive for "sum minutes per category, honoring rounding order" — `pages/index.vue`'s `finalizeForDay`, `summaryBadgesForDay`, `computeRoundedTotal`, and the calendar's per-day cells all build on it rather than reimplementing grouping/rounding themselves. A `now` ref ticks every second to keep in-progress entry durations reactive.

## ESLint

Uses `@nuxt/eslint` with stylistic rules: no trailing commas, `1tbs` brace style.
