# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # Start dev server (http://localhost:3000)
pnpm build        # Production build
pnpm lint         # ESLint
pnpm typecheck    # vue-tsc type checking
```

CI runs `pnpm lint` and `pnpm typecheck` on every push. No tests exist.

## Architecture

Nuxt 4 app with Nuxt UI v4, Tailwind v4, and Lucide icons. Theme: green primary, slate neutral.

### State Management

All shared state lives in `app/composables/useWorkEntries.ts` as module-level refs (singleton pattern), shared between `app.vue` (header controls, config modal) and `pages/index.vue` (entry UI, keyboard handling).

### Keyboard-Driven Input

The app does **not** use native form inputs. A global `keydown` listener in `pages/index.vue` appends characters programmatically to the current entry's `category` or `content` field. The `editingField` ref controls which field receives input.

A PostToolUse hook (`.claude/settings.local.json`) reminds you to keep the hotkeys guide template in `pages/index.vue` in sync when editing `index.vue`, `useWorkEntries.ts`, or `app.vue`.

### Data Flow

Entries persist to `localStorage` (key: `working-hours-entries`). The `finalizedEntries` computed handles category grouping, time rounding, and content deduplication for the Summarize View. A `now` ref ticks every second to keep in-progress entry durations reactive.

## ESLint

Uses `@nuxt/eslint` with stylistic rules: no trailing commas, `1tbs` brace style.
