---
trigger: manual
---

# MyDay — Project Overview, Stack & Architecture
# Activation: Always On
# Read this before writing any code, generating any component, or making any architectural suggestion.
# Last updated: February 2026

---

## Project Overview

MyDay is a unified daily and weekly planning dashboard for students and busy
professionals. Users log tasks, meetings, assignments, deadlines, and events in
one place. The app surfaces everything across three real-time-synced views: a
scrollable weekly calendar strip, a weekly overview section, and a to-do
checklist for today. A daily intro carousel greets returning users each morning.

The core design philosophy: stay out of the user's way. Inputs are fast, layouts
are scannable, and every change is reflected instantly everywhere.

**PRD Reference:** `MyDay_PRD.md` in the project root — read this before
implementing any feature. It contains the full item model, per-type field
visibility rules, UX flows, and design system tokens.

---

## Tech Stack & Versions

- **Framework:** Next.js 14.x (App Router) — full-stack in one repo
- **Language:** TypeScript 5.x — strict mode, no `any` types ever
- **Styling:** Tailwind CSS 3.x + CSS custom properties (variables) for theming
- **UI Components:** shadcn/ui — headless, unstyled base; always customize to match design system
- **State:** Zustand 4.x — one global store, one slice per feature domain
- **Data fetching:** SWR 2.x — all server data fetched via SWR hooks; never fetch in components directly
- **Database:** SQLite via Prisma ORM 5.x
- **Animations:** Framer Motion 11.x — use for all meaningful transitions; no raw CSS keyframes for interactive motion
- **Date handling:** date-fns 3.x only — never use `new Date()` arithmetic directly; always use date-fns helpers
- **Validation:** Zod 3.x — all API request/response bodies validated with Zod schemas
- **Auth:** Local session only — UUID token in localStorage, sent as `X-Session-Token` header

---

## Architecture Decisions

- **Server Components by default.** Use `"use client"` only when a component needs interactivity (event handlers, hooks, animations). Never add `"use client"` preemptively.
- **API routes live in `app/api/`.** All data mutations go through API routes — never write to the DB from a Server Component.
- **All routes require auth.** Every API route must validate `X-Session-Token` at the top and return `401` if missing or invalid. Use the shared `validateSession(req)` helper — do not inline this logic.
- **Optimistic updates are mandatory for all mutations.** Write to the Zustand store before the API call fires. Roll back on error and show an error toast.
- **The Zustand store is the real-time sync layer.** All three home-screen views (calendar strip, overview, to-do list) subscribe to the same store slice. A mutation anywhere must propagate to all three instantly — this is a core product requirement, not a nice-to-have.
- **Recurrence is expanded at read time, not write time.** Store only the base item + recurrence rule in the DB. Expand recurring instances into virtual items in the API `GET /api/items/week` route. Never write duplicate rows for recurring items.
- **No external calendar integrations.** This is intentionally standalone. Do not suggest or add Google Calendar, Outlook, or any third-party calendar SDK.
- **No third-party auth.** No NextAuth, no Clerk, no OAuth. Session is a UUID token only.

---

## File & Folder Structure

```
app/
  (home)/               # Home screen route group
    page.tsx            # Home screen — Server Component shell
  api/
    session/
      route.ts          # POST + GET /api/session
    items/
      route.ts          # GET + POST /api/items
      [id]/
        route.ts        # PATCH + DELETE /api/items/:id
      week/
        route.ts        # GET /api/items/week
components/
  ui/                   # shadcn/ui base components (do not edit directly)
  carousel/             # Intro carousel components
  home/                 # Home screen section components
  sheets/               # Bottom sheet modals (AddItemSheet, DayDetailSheet)
  shared/               # Reusable across features (ItemRow, PriorityBadge, etc.)
lib/
  store.ts              # Zustand store — all slices defined here
  session.ts            # validateSession() helper
  db.ts                 # Prisma client singleton
  recurrence.ts         # Recurrence expansion logic
  overviewQuip.ts       # Weekly overview sentence generator (client-side, template-based)
  fonts.ts              # next/font definitions for all three typefaces
  schemas.ts            # All Zod schemas for API validation
hooks/
  useItems.ts           # SWR hook for item data
  useWeekItems.ts       # SWR hook for full-week data
  useSession.ts         # Session validation hook
prisma/
  schema.prisma
```

---

## Out of Scope (Do Not Implement)

Explicitly excluded from MVP. Do not add stubs or placeholders.

- External calendar sync (Google Calendar, Apple Calendar, Outlook)
- Push notifications or browser reminders
- Multi-device sync (requires PostgreSQL + cloud hosting migration)
- Shared or collaborative calendars
- AI-generated overview text (use template-based `lib/overviewQuip.ts`)
- File attachments on items
- OAuth or any third-party authentication

---

## Build & Dev Commands

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