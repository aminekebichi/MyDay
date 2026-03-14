# MyDay

A unified daily planning dashboard that consolidates your tasks, meetings, and deadlines into one real-time interface — scrollable calendar, weekly overview, and daily checklist all in one place.

---

## Table of Contents

- [About](#about)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [User Personas](#user-personas)
- [User Stories](#user-stories)
- [Team](#team)
- [Deep Dive](#deep-dive)

---

## About

Managing tasks, deadlines, meetings, and assignments happens across disconnected tools with no single, coherent view of the day. **MyDay** gives every user a unified planning dashboard where they can log tasks, schedule meetings, and track deadlines across three core views:

- **Scrollable Calendar Strip** — A 730-day forward-looking horizontal timeline showing item previews per day, with month/year markers and smooth scroll navigation.
- **Weekly Overview** — A template-generated natural-language summary of the week's priorities, with a contextual quip that reflects how busy the schedule looks.
- **Daily To-Do Checklist** — Surfaces the selected day's items sorted by priority, with inline completion toggling and real-time progress tracking.

Every interaction — adding an item, marking something complete, or switching the selected day — is reflected **instantly across all three views** through a shared Zustand store. No page reloads, no stale data.

---

## Features

- **Scrollable infinite calendar** — 730-day horizontal timeline from today, with color-coded item previews, past-date hatching, and a back-to-today pill that fades in on scroll
- **Five item types** — Task, Assignment, Event, Meeting, and Deadline, each with type-specific fields (attendee, location, join URL) that appear contextually in the form
- **Three priority levels** — Critical, Important, and Routine, surfaced through priority bars on each item and driving sort order across all views
- **Recurrence support** — Daily, weekly, and monthly rules stored once and expanded at read time; never writes duplicate rows
- **Optimistic updates** — All mutations update the UI before the API responds and roll back automatically on failure
- **Weekly overview quip** — Template-based natural language summary of the week's workload; no external AI API
- **Admin multi-user view** — Admins can switch between user calendars or view a master aggregated feed of all items
- **Light / dark theme** — Warm Claude-inspired palette driven entirely by CSS custom properties; preference persisted to localStorage
- **Accessible by default** — 44×44px tap targets, native `<button>` elements, `aria-label` on icon controls, focus management in sheets, and `prefers-reduced-motion` support throughout

---

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| **Framework** | Next.js (App Router) | 14.2 |
| **Language** | TypeScript (strict) | 5.7 |
| **Styling** | Tailwind CSS + CSS custom properties | 3.4 |
| **Components** | shadcn/ui | — |
| **State management** | Zustand | 4.5 |
| **Data fetching** | SWR | 2.2 |
| **Database** | SQLite via Prisma ORM | 5.22 |
| **Animation** | Framer Motion | 12 |
| **Date utilities** | date-fns | 3.6 |
| **Validation** | Zod | 3.23 |
| **Auth** | JWT (jose) + bcryptjs | jose 6.2 |
| **Testing** | Vitest + React Testing Library | Vitest 2.1 |

**Architecture notes:**
- No separate backend — API routes live in `app/api/` alongside the frontend
- No OAuth or third-party auth — local session tokens sent as `X-Session-Token` header
- Server Components by default; `"use client"` only where event handlers or hooks are needed
- All data mutations go through API routes — no direct DB writes from components

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
# 1. Install dependencies
npm install

# 2. Generate the Prisma client
npx prisma generate

# 3. Apply the database schema
npx prisma migrate dev --name init

# 4. Seed with demo data
npx prisma db seed

# 5. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Other Commands

```bash
npm run build        # Production build
npm run lint         # ESLint
npm run test         # Run tests once (Vitest)
npm run test:watch   # Run tests in watch mode
npm run test -- --coverage  # Run tests with coverage report
npx prisma studio    # Open Prisma database browser
```

### Test Accounts

| Role | Username | Password |
|---|---|---|
| Admin | `admin` | `admin` |
| User | `amine` | `amine` |
| User | `sarah` | `sarah` |
| User | `bob` | `bob` |

---

## Project Structure

```
app/
  (home)/page.tsx           # Home screen — Server Component shell
  api/
    auth/                   # POST /api/auth/login, /api/auth/signup
    items/route.ts          # GET + POST /api/items
    items/[id]/route.ts     # PATCH + DELETE /api/items/:id
    items/week/route.ts     # GET /api/items/week (expands recurrence)
    users/route.ts          # GET /api/users (admin only)
components/
  auth/                     # LoginForm, SignupForm
  home/                     # Dashboard, CalendarStrip, TodoToday, OverviewSection
  sheets/                   # AddItemSheet, DayDetailSheet
  shared/                   # ItemRow, PriorityBadge
  ui/                       # shadcn/ui base components
lib/
  store.ts                  # Zustand store (items + session slices)
  session.ts                # validateSession() helper
  db.ts                     # Prisma client singleton
  recurrence.ts             # Recurrence expansion logic
  overviewQuip.ts           # Template-based weekly summary generator
  schemas.ts                # Zod schemas for all API validation
  constants.ts              # Item types, priorities, category colours
hooks/
  useWeekItems.ts           # SWR hook — fetches 14-day window, populates store
  useSession.ts             # Session validation hook
prisma/
  schema.prisma             # User + Item models
  seed.js                   # Demo data seed
```

---

## User Personas

| Persona | Description |
|---|---|
| **The Overwhelmed Student** | Juggles coursework, group projects, and personal commitments across multiple platforms and just wants one place to see everything without switching between apps. |
| **The Busy Professional** | Moves between back-to-back meetings and needs a fast, frictionless way to log tasks and know exactly what needs to happen today. |
| **The Forgetful Planner** | Loses track of deadlines and recurring obligations and needs a reliable, always-current view of the week to stay on top of things. |

---

## User Stories

- As a **new user**, I want to create an account and set up my profile so that my dashboard is personalized and ready to use.
- As a **student**, I want to add assignments and deadlines quickly so that they appear on my checklist and calendar without extra steps.
- As a **busy user**, I want to log meetings and events in seconds so that my weekly overview stays accurate without disrupting my flow.
- As a **daily planner**, I want to check off completed tasks so that my to-do list reflects what is actually left to do today.
- As a **schedule-aware user**, I want all three views to update in real time whenever I make a change so that I never see stale or conflicting information.
- As a **returning user**, I want my dashboard to load with my current week already populated so that I can get oriented immediately without any setup.
- As an **admin**, I want to switch between user calendars and view an aggregated feed so that I can see the full team picture at a glance.

---

## Team

| Name | GitHub |
|---|---|
| Amine Kebichi | [@aminekebichi](https://github.com/aminekebichi) |
| Nicholas Annunziata | [@nca0716](https://github.com/nca0716) |

**Demo:** [YouTube](https://www.youtube.com/watch?v=_T5EbpoYrGs&feature=youtu.be)

---

## Deep Dive

### The Problem: Too Many Places to Look

Modern productivity tools are supposed to make life easier, but a lot of the time they end up doing the opposite. Tasks live in one app, calendar events live somewhere else, reminders show up through notifications, and notes get scattered across different systems. When you actually try to figure out what you need to do today, you often end up jumping between multiple tools just to piece together the full picture.

The idea behind MyDay was to reduce that fragmentation. Instead of switching between a to-do list, a calendar, and whatever system someone uses for planning their week, we wanted one place that could show everything together and stay updated in real time.

### Choosing the Stack

The application is built with Next.js using the App Router architecture, which lets server-side data fetching happen directly within the framework. API routes and frontend code live in the same project — the `app/api` directory handles backend logic while the rest manages the interface.

For persistence we used Prisma with SQLite. SQLite requires almost no infrastructure to set up, and Prisma keeps the data layer flexible — switching to PostgreSQL for production would mainly involve configuration changes, not rewritten logic.

### Managing State with Zustand

Rather than keeping separate state inside each component, MyDay uses a shared Zustand store containing the full list of loaded items. Components subscribe only to the slices they need, which keeps the calendar, checklist, and overview synchronized without passing data between components.

When a user marks a task complete in the checklist, the calendar immediately reflects that change — both views are reading from the same underlying state.

### Making the Interface Feel Instant

When a user creates or modifies an item, the change appears immediately in the UI. At the same time, a request is sent to the server to persist the change. If the request fails, the application rolls back automatically and shows an error toast. This optimistic update pattern keeps the interface feeling immediate regardless of network latency.

### Handling Recurring Tasks

Rather than storing a database row for every occurrence of a repeating item, MyDay stores only the recurrence rule. When the API serves a date window, it expands recurring items into virtual instances dynamically. These instances exist only in the API response — they are never written to the database — keeping the data model clean regardless of how far out a recurrence extends.

### Building the Horizontal Calendar

The calendar strip renders a 730-day forward-looking timeline. A date-indexed map is built from the store on each items change, giving each day card O(1) access to its items without filtering the full list. Month and year markers are inserted as inline dividers, and a fixed overlay on the left edge mirrors the active month and year so the user always has context while scrolling.

### Adding Personality

To give the interface a human feel, a weekly overview section generates a short natural-language summary of the week's workload from a set of templates — no language model or external API involved. The message adapts based on item count, priority mix, and upcoming deadlines, and is rendered in a handwriting-style font (Caveat) to keep the tone warm rather than mechanical.

### Lessons from Development

A major merge conflict mid-project affected several API routes and parts of the authentication system. Resolving it required restructuring parts of the session handling — and in the process, the earlier identifier-based session system was replaced with a more robust JWT-based approach. The incident pushed the architecture in a better direction.

### Accessibility

Interactive elements use standard HTML elements (`<button>`, `<a>`) so keyboard navigation works without extra configuration. All icon-only controls carry `aria-label` attributes. Animations are wrapped in `prefers-reduced-motion` checks so users who have motion effects disabled at the OS level see simpler transitions. Minimum tap target size across the interface is 44×44px per WCAG 2.5.5.
