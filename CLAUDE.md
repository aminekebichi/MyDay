# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev                          # Start dev server (localhost:3000)
npm run build                        # Production build
npm run lint                         # ESLint
npm run test                         # Vitest (run once)
npm run test:watch                   # Vitest (watch mode)
npx prisma migrate dev --name <n>    # Create and apply a DB migration
npx prisma studio                    # Open Prisma DB browser
npx prisma generate                  # Regenerate Prisma client after schema changes
```

## Architecture Overview

MyDay is a Next.js 14 App Router full-stack app (no separate backend). Three home-screen views — a scrollable weekly calendar strip, a weekly overview section, and a to-do checklist — all share a single Zustand store slice and must update in real time (< 500 ms) on any mutation.

**Stack:** TypeScript (strict, no `any`), Tailwind CSS + CSS variables, shadcn/ui, Zustand 4.x, SWR 2.x, SQLite via Prisma 5.x, Framer Motion 11.x, date-fns 3.x, Zod 3.x.

**Auth:** Local session only — UUID token stored as `myday_session_token` in localStorage, sent as `X-Session-Token` header. No NextAuth, Clerk, or OAuth.

### Key Architectural Rules

- **Server Components by default.** Add `"use client"` only when a component needs event handlers, hooks, or animations. Never add it to `page.tsx` or `layout.tsx`.
- **All data mutations go through API routes** (`app/api/`) — never write to the DB from a Server Component or component directly.
- **Every API route** must call `validateSession(req)` from `lib/session.ts` first and return `401` on failure. Never inline this logic.
- **Optimistic updates are mandatory** for every mutation: write to Zustand store before firing the API call; rollback and show error toast on failure.
- **Recurrence is expanded at read time, not write time.** Store only the base item + recurrence rule. Expand recurring instances into virtual items in `GET /api/items/week`. Never write duplicate DB rows for recurring items.
- **Never use `new Date()` arithmetic** — always use date-fns helpers.
- **Never hardcode hex values** in component files — always use `var(--token-name)` CSS custom properties.
- Use Zod schemas in `lib/schemas.ts` for all API request/response validation.

### Folder Structure

```
app/
  (home)/page.tsx         # Home screen — Server Component shell
  api/session/route.ts    # POST + GET /api/session
  api/items/route.ts      # GET + POST /api/items
  api/items/[id]/route.ts # PATCH + DELETE /api/items/:id
  api/items/week/route.ts # GET /api/items/week (expands recurrence)
components/
  ui/                     # shadcn/ui base — do not edit directly
  carousel/               # Intro carousel (CarouselHeader, DailyOverviewSlide, WeekAheadSlide)
  home/                   # CalendarStrip, TodoToday, OverviewSection
  sheets/                 # AddItemSheet, DayDetailSheet
  shared/                 # ItemRow, PriorityBadge — reused across features
lib/
  store.ts                # Zustand store — all slices here
  session.ts              # validateSession() helper
  db.ts                   # Prisma client singleton
  recurrence.ts           # Recurrence expansion logic
  overviewQuip.ts         # Template-based weekly summary generator (client-side, no AI)
  fonts.ts                # next/font definitions for Instrument Serif, Geist Mono, Caveat
  schemas.ts              # All Zod schemas
hooks/
  useItems.ts             # SWR hook for item data
  useWeekItems.ts         # SWR hook for full-week data
  useSession.ts           # Session validation hook
prisma/schema.prisma
```

### Data Flow

1. SWR hooks (`hooks/`) fetch from API routes and populate the Zustand store.
2. Components read from the Zustand store — never fetch directly in components.
3. Mutations: optimistic store update → API call → rollback on error.
4. All three home views subscribe to the same store slice and re-render on any item change.

### Design System

**Theming:** CSS custom properties on `<html data-theme="...">`, defined in `globals.css`. Dark mode is default. Theme preference persisted to localStorage.

**Color palette — Claude-inspired:** Mirrors the Claude Web aesthetic. Dark mode uses near-black surfaces with warm undertones (`#0F0F0E` base) and a warm coral/terracotta accent (`#D4846A`). Light mode uses warm cream/parchment surfaces (`#FAF9F7` base) with the same coral accent deepened for contrast (`#C06B4A`). All borders and muted text carry warm gray undertones rather than cool blue-gray.

| Token | Dark | Light | Role |
|-------|------|-------|------|
| `--bg-base` | `#0F0F0E` | `#FAF9F7` | Primary background |
| `--bg-surface` | `#1A1917` | `#F0EDE8` | Cards, panels, sheets |
| `--bg-elevated` | `#252320` | `#FFFFFF` | Today column, modals |
| `--text-primary` | `#ECECEA` | `#1A1916` | Main readable text |
| `--text-muted` | `#888582` | `#8B8680` | Labels, placeholders |
| `--accent` | `#D4846A` | `#C06B4A` | Brand CTA, today highlight |
| `--border` | `#2E2B28` | `#E5E0D8` | Borders, dividers |

**Typography — three fonts, three roles:**
- `Instrument Serif` — display, logo, section headings
- `Geist Mono` (light) — all body text, item labels, timestamps
- `Caveat` — personality/warmth only: weekly overview quip, carousel tagline beneath logo, empty-state copy. Never use for labels, navigation, buttons, or body text.

**Category/priority colors** are intentionally muted and warm-leaning (see `CATEGORY_COLORS` and `PRIORITY_COLORS` in `lib/constants.ts`). Never use bright or fully saturated colors. Never hardcode hex values in component files — always use `var(--token-name)` CSS custom properties for the theme tokens.

### Session & Carousel Gate

- No session token → first-time onboarding tour (3-step: Welcome, Feature Tour, Profile Setup).
- Valid token + `user.lastOpenedAt` before 4:00 AM local today → Intro Carousel (3 slides).
- After carousel dismissal: `PATCH user.lastOpenedAt` before rendering home screen.

### Accessibility (Non-Negotiable)

- Minimum 44×44 px tap targets (WCAG 2.5.5).
- Use native `<button>` and `<a>` — never `<div onClick>`.
- All icon-only buttons must have `aria-label`.
- Focus management: sheets open → focus first focusable element; close → return focus to trigger.
- Wrap all Framer Motion animations in a `prefers-reduced-motion` check.
- In tests, use `getByRole`/`getByLabelText` — not `getByTestId`.

### Testing

- **Framework:** Vitest + React Testing Library, co-located as `*.test.ts` / `*.test.tsx`.
- Unit test all `lib/` helpers; integration test API routes; component tests assert behavior only.
- Mock Prisma with `vi.mock` or `jest-mock-extended`.

### Git & GitHub Workflow

**Branch naming:**
- `feature/[issue-number]-[short-description]`
- `fix/[issue-number]-[short-description]`
- `chore/[issue-number]-[short-description]`
- Always branch from `main`.

**Commit format:** `Verb description (#issue-number)` — present-tense imperative, under 72 chars.
Example: `Add scrollable calendar strip component (#6)`

**Code references:** add a comment above every implementing function:
```ts
// Implements #6: scrollable weekly calendar strip
```

**PR body** must include `Closes #[issue-number]`, a summary of changes, and screenshots for UI changes.

### Out of Scope (Do Not Implement)

- External calendar sync (Google Calendar, Apple Calendar, Outlook)
- Push notifications or browser reminders
- Multi-device sync
- Shared/collaborative calendars
- AI-generated overview text — use template-based `lib/overviewQuip.ts`
- File attachments
- OAuth or any third-party authentication
