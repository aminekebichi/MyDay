# MyDay — Product Requirements Document
**Version 1.0 · MVP · February 2026**

---

## Table of Contents
1. [Product Overview](#1-product-overview)
2. [User Stories](#2-user-stories)
3. [Recommended Tech Stack](#3-recommended-tech-stack)
4. [Feature Specifications](#4-feature-specifications)
5. [Design System](#5-design-system)
6. [Data Architecture & API](#6-data-architecture--api)
7. [Key UX Flows](#7-key-ux-flows)
8. [Out of Scope (Post-MVP)](#8-out-of-scope-post-mvp)
9. [MVP Development Milestones](#9-mvp-development-milestones)

---

## 1. Product Overview

MyDay is a unified daily and weekly planning dashboard designed for students and busy professionals who manage tasks, deadlines, meetings, and assignments across disconnected tools. The application surfaces every actionable item in a single, coherent interface that updates in real time across three core views, eliminating the cognitive overhead of context-switching.

### 1.1 Problem Statement

Modern students and professionals fragment their planning across calendar apps, note-taking tools, task managers, and messaging platforms. No single surface gives them a clear, immediate answer to the question: *"What do I need to do today?"* MyDay answers that question the moment the app is opened.

### 1.2 Target Users

**The Overwhelmed Student**
- Juggles coursework, group projects, and personal commitments across multiple platforms
- Needs one place to see everything without switching apps

**The Busy Professional**
- Moves between back-to-back meetings throughout the day
- Needs a fast, frictionless way to log tasks and know exactly what is due today

**The Forgetful Planner**
- Loses track of deadlines and recurring obligations
- Needs a reliable, always-current view of the week

### 1.3 Success Metrics (MVP)

- Time-to-first-task-logged under 30 seconds from first open
- All three home views reflect item changes within 500 ms without a page reload
- Daily intro carousel loads and completes in under 2 seconds
- Mobile-responsive layout renders correctly at 375 px and 768 px breakpoints

---

## 2. User Stories

| ID | Story |
|----|-------|
| US-01 | As a new user, I want to create a local session profile so that my dashboard is personalized and ready to use. |
| US-02 | As a student, I want to add assignments and deadlines quickly so that they appear on my checklist and calendar without extra steps. |
| US-03 | As a busy user, I want to log meetings and events in seconds so that my weekly overview stays accurate without disrupting my flow. |
| US-04 | As a daily planner, I want to check off completed tasks so that my to-do list reflects what is actually left to do today. |
| US-05 | As a schedule-aware user, I want all three views to update in real time whenever I make a change so that I never see stale or conflicting information. |
| US-06 | As an overwhelmed student, I want a weekly overview that highlights my most important upcoming events and deadlines so that I can prioritize without digging. |
| US-07 | As a returning user, I want my dashboard to load with my current week already populated so that I can get oriented immediately. |
| US-08 | As a planner, I want to set items as recurring so that weekly meetings and obligations appear automatically on future days. |

---

## 3. Recommended Tech Stack

### 3.1 Stack Overview

| Layer | Technology |
|-------|------------|
| Frontend Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + CSS Variables |
| UI Components | shadcn/ui (headless, fully customizable) |
| State Management | Zustand (lightweight global store) |
| Database | SQLite via Prisma ORM (local-first MVP) |
| Session / Auth | Local session (username + device-pinned UUID token in localStorage) |
| Real-time Updates | React optimistic updates + SWR for revalidation |
| Animations | Framer Motion |
| Date / Time | date-fns |
| Hosting | Vercel (zero-config Next.js deployment) |

### 3.2 Stack Rationale

- **Next.js** — Full-stack in a single repo; API routes eliminate a separate backend service for MVP. App Router enables React Server Components for fast initial loads.
- **SQLite + Prisma** — Zero-infrastructure database for MVP. Prisma migrations make a future swap to PostgreSQL (for multi-device or cloud) a one-line config change.
- **Local Session** — No OAuth complexity for MVP. A user enters a display name on first launch; a UUID session token is persisted in localStorage and sent with every API request.
- **Zustand** — Minimal boilerplate for cross-view real-time sync. A single store slice invalidates all three home views on any mutation.
- **Framer Motion** — Powers the intro carousel slide transitions and micro-interactions without heavy CSS complexity.

---

## 4. Feature Specifications

### 4.1 Session & Onboarding

#### 4.1.1 First-Time User Flow

When no session token exists in localStorage, the application renders a full-screen onboarding tour instead of the intro carousel. The tour walks the user through the three core areas of the app using annotated mock screens before prompting them to enter a display name.

- **Step 1 — Welcome Splash:** App name, tagline, "Get Started" CTA
- **Step 2 — Feature Tour:** Annotated walkthrough of the scrollable calendar, weekly overview, and to-do checklist via illustrated mock screens
- **Step 3 — Profile Setup:** User enters display name. Session token generated and stored.
- After setup completes, user lands directly on the home screen. The intro carousel fires from the next morning onward.

#### 4.1.2 Returning User — Daily Intro Carousel

On any day after the user's first session, if the app has not been opened since 4:00 AM local time, a full-screen carousel appears before the home screen. It consists of exactly three slides styled after Apple's iPhone Quick Start onboarding aesthetic: minimal, centered, typographically bold, with a soft gradient background that respects the active color theme.

- **Slide 1 — Header:** Full-screen logo / app name. Auto-advances after 1.5 s or on swipe.
- **Slide 2 — My Daily Overview:** Narrated summary of today's most significant events. Displays today's task checklist with category and priority indicators, and a meeting/call card for the next scheduled meeting. Scrollable if content overflows. Can span multiple swipeable sub-slides.
- **Slide 3 — The Week Ahead:** Scrollable carousel calendar strip showing the current week. A one-sentence overview quip of the week. A prioritized list of the most important upcoming events, assignments, and meetings for the next seven days. Can span multiple swipeable sub-slides.
- **Dismissal:** User taps anywhere or swipes past the last slide to reveal the home screen. Progress dots at the bottom track position.

---

### 4.2 Home Screen

The home screen is the core surface of the application. It is a single scrollable page with three stacked sections. All sections share a single reactive data layer — a mutation in any section propagates to the others instantly via the Zustand store.

#### 4.2.1 Scrollable Carousel Calendar (Top Section)

- A horizontally scrollable strip spanning the full width of the screen
- Each column represents one day of the current week (Mon–Sun)
- Today's column is visually elevated (accent border, slightly wider, white background in dark mode)
- Past days are muted (reduced opacity, faded/hatched background)
- Each day column shows: date label and up to 3 preview items (events, tasks, assignments) with overflow indicated by a `+N more` chip
- Tapping a day column opens a day-detail bottom sheet

#### 4.2.2 Overview Section (Middle)

- A short, dynamically generated sentence or two summarizing the current week (e.g., *"You have 4 tasks today and an interview on Friday."*)
- Generated client-side from the user's data — no external AI call required for MVP
- Updates reactively as items are added or completed

#### 4.2.3 To-Do Today (Bottom Section — Scrollable)

- Displays all items due or scheduled for today, sorted by priority then time
- Each item is a tappable row with: category color pill, item name, priority indicator, and a checkbox
- Checking an item marks it complete, strikes through the text, and moves it to the bottom of the list with a smooth animation
- A sticky **"Add to MyDay"** button (pill-shaped, `+` icon) is fixed to the bottom of the screen. Tapping it opens the Add Item sheet.

---

### 4.3 Item Model

All schedulable items share a common data model with a required `type` discriminant field.

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | UUID, auto-generated |
| `userId` | `string` | Foreign key to session user |
| `title` | `string` | Short label (required) |
| `type` | `enum` | `task \| assignment \| event \| meeting \| deadline` |
| `priority` | `enum` | `routine \| important \| critical` |
| `date` | `string` | ISO date (required) |
| `startTime` | `string?` | ISO time — start time (optional; shown for `meeting` and `event`) |
| `endTime` | `string?` | ISO time — end time (optional; shown for `meeting` and `event`) |
| `location` | `string?` | Physical address or venue name — for `event` and `meeting` types |
| `joinUrl` | `string?` | Virtual meeting link (Zoom, Google Meet, Teams, etc.) — for `meeting` type; stored as plain URL, opened natively by the browser |
| `recurrence` | `enum` | `none \| daily \| weekly \| monthly` |
| `recurrenceEndDate` | `string?` | Optional ISO date |
| `notes` | `string?` | Freeform text (optional) |
| `attendeeName` | `string?` | For `meeting` type only |
| `completedAt` | `string?` | Nullable; set when checked off |
| `createdAt` | `string` | Auto-set on creation |

> **Field scoping by type:** Not all fields are presented to the user for every item type. See section 4.4 for the per-type field visibility rules.

---

### 4.4 Add / Edit Item Sheet

A bottom sheet modal triggered by "Add to MyDay" or by tapping any existing item. Fields are shown or hidden based on the selected type — the sheet never displays irrelevant fields.

- **Type selector** (segmented control): Task, Assignment, Event, Meeting, Deadline
- **Title field** — autofocused on open
- **Date picker** — defaults to today
- **Priority selector** — Routine, Important, Critical
- **Recurrence toggle** — None / Daily / Weekly / Monthly, with optional end date
- **Notes field** — optional, collapsed by default
- **Save / Cancel** — Save disabled until Title + Date are filled

#### Per-Type Field Visibility

| Field | Task | Assignment | Event | Meeting | Deadline |
|-------|------|------------|-------|---------|----------|
| Start Time | — | — | ✓ | ✓ | — |
| End Time | — | — | ✓ | ✓ | — |
| Location | — | — | ✓ | ✓ | — |
| Join URL (virtual link) | — | — | — | ✓ | — |
| Attendee Name | — | — | — | ✓ | — |

**Field notes:**
- **Start / End Time** — shown as a paired time range picker for `event` and `meeting`; end time is optional but encouraged
- **Location** — plain text field for address or venue name (e.g., "Room 204, Main Hall" or "123 Broadway St, MA"); shown for `event` and `meeting`
- **Join URL** — free-text URL input for any virtual meeting link (Zoom, Google Meet, Teams, etc.); no validation beyond basic URL format; rendered in the item detail view as a tappable "Join" button that opens the link in a new browser tab — no third-party SDK or calendar integration required
- **Attendee Name** — single text field for `meeting` type; rendered as a contact card chip in the carousel and overview slides

---

### 4.5 Real-Time Cross-View Sync

All three home-screen sections subscribe to the same Zustand slice. When any item is created, updated, or deleted, the store updates optimistically and triggers a background revalidation via SWR. Target latency from user action to visible update across all views: **< 500 ms**.

---

## 5. Design System

### 5.1 Theme — Obsidian-Inspired

The color palette mirrors Obsidian's dark and light modes: deep navy/charcoal surfaces for dark mode; warm off-white and soft gray surfaces for light mode. The user can toggle themes; preference is persisted to localStorage.

#### Dark Mode Palette

| Token | Value | Role |
|-------|-------|------|
| `--bg-base` | `#1E1E2E` | Primary app background |
| `--bg-surface` | `#27273A` | Cards, panels, sheet backgrounds |
| `--bg-elevated` | `#313145` | Elevated surfaces (today column, modals) |
| `--text-primary` | `#CDD6F4` | Main readable text |
| `--text-muted` | `#7F849C` | Secondary labels, placeholders |
| `--accent` | `#7C3AED` | Primary accent (brand, CTA, today highlight) |
| `--border` | `#45475A` | Subtle borders and dividers |

#### Light Mode Palette

| Token | Value | Role |
|-------|-------|------|
| `--bg-base` | `#FAFAF8` | Warm off-white base |
| `--bg-surface` | `#F1F0EC` | Slightly darker surface |
| `--bg-elevated` | `#FFFFFF` | Cards and modals |
| `--text-primary` | `#1E1E2E` | Near-black text |
| `--text-muted` | `#6C6C80` | Muted labels |
| `--accent` | `#5B21B6` | Darker purple for light-mode contrast |
| `--border` | `#D9D7D0` | Soft warm gray borders |

---

### 5.2 Category Color Coding (Muted)

All category colors are desaturated to maintain Obsidian's understated aesthetic. Color is applied as a left-border stripe and a faint background tint on item rows.

| Category | Dark Mode | Light Mode | Character |
|----------|-----------|------------|-----------|
| `task` | `#4A4A8A` | `#6B6BAA` | Slate blue |
| `assignment` | `#6A4A2A` | `#8B6A4A` | Muted amber |
| `event` | `#2A5A4A` | `#3A7A6A` | Forest green |
| `meeting` | `#2A4A6A` | `#3A6A8A` | Steel blue |
| `deadline` | `#6A2A2A` | `#8A4A4A` | Muted rose |

---

### 5.3 Priority Levels

Priority is expressed through a subtle left-accent indicator and a small badge label. Colors are intentionally muted to avoid visual noise in dense lists.

| Enum Value | Display Name | Color (Dark) | Color (Light) |
|------------|-------------|--------------|---------------|
| `routine` | Routine | `#7F849C` | `#9090AA` |
| `important` | Important | `#A07A3A` | `#B08040` |
| `critical` | Critical | `#8A3A3A` | `#9A4040` |

---

### 5.4 Typography

The app uses three font families. Instrument Serif handles all display and heading roles. Geist Mono covers body text and data-dense UI. **Caveat** serves as the personality font — a legible, handwritten-style cursive applied anywhere a human, informal, or expressive tone is appropriate.

| Role | Font | Spec |
|------|------|------|
| Display / Logo | Instrument Serif | 48–72 px — carousel header slide and branding |
| Section Headings | Instrument Serif | 20–28 px, semi-bold |
| Body / Labels | Geist Mono (light) | 13–15 px — all item labels and UI text |
| Metadata / Timestamps | Geist Mono | 11 px, muted color |
| CTA Buttons | Geist | 14 px, medium weight |
| **Carousel Tagline / Subtext** | **Caveat** | **16–18 px — the small descriptive text beneath the logo on the intro carousel Header slide** |
| **Weekly Overview Quip** | **Caveat** | **18–20 px — the generated summary sentence on the home screen and Week Ahead carousel slide** |

> **Personality font guidance — Caveat (Google Fonts):** Use Caveat wherever the interface benefits from a warmer, more personal voice. Current designated locations: (1) the tagline/subtext beneath the logo on the intro carousel Header slide, and (2) the weekly overview quip on the home screen and Week Ahead slide. As the app evolves, Caveat may also be appropriate for empty-state messages, onboarding callout text, or any short motivational copy — use judgment to keep it feeling intentional rather than scattered.

> **Rationale:** Instrument Serif gives the app a refined, editorial quality that differentiates it from generic productivity tools. Geist Mono grounds the data-dense list areas in a clean, technical aesthetic consistent with Obsidian's developer-friendly feel. Caveat adds a handwritten warmth that makes the app feel personal and alive without breaking the overall composed visual system.

---

### 5.5 Motion Principles

| Interaction | Spec |
|-------------|------|
| Carousel slide transition | Horizontal spring, 400 ms, Framer Motion |
| Sheet open / close | Slide-up from bottom, 300 ms ease-out |
| Task completion | Strike-through left→right (200 ms), fade + translate to bottom (250 ms) |
| Calendar day scroll | Momentum-based native scroll, no artificial easing |
| Theme toggle | 200 ms CSS transition on all color tokens |

---

## 6. Data Architecture & API

### 6.1 Prisma Schema

```prisma
model User {
  id            String    @id @default(uuid())
  displayName   String
  sessionToken  String    @unique
  theme         String    @default("dark")
  lastOpenedAt  DateTime?
  createdAt     DateTime  @default(now())
  items         Item[]
}

enum ItemType {
  TASK
  ASSIGNMENT
  EVENT
  MEETING
  DEADLINE
}

enum Priority {
  ROUTINE
  IMPORTANT
  CRITICAL
}

enum Recurrence {
  NONE
  DAILY
  WEEKLY
  MONTHLY
}

model Item {
  id                String     @id @default(uuid())
  userId            String
  user              User       @relation(fields: [userId], references: [id])
  title             String
  type              ItemType
  priority          Priority
  date              DateTime
  time              DateTime?
  recurrence        Recurrence @default(NONE)
  recurrenceEndDate DateTime?
  notes             String?
  attendeeName      String?
  completedAt       DateTime?
  createdAt         DateTime   @default(now())
}
```

### 6.2 API Routes (Next.js App Router)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/session` | Create session — accepts `displayName`, returns `sessionToken` + `userId` |
| `GET` | `/api/session` | Validate session token, return user profile |
| `GET` | `/api/items?date=` | Return all items for a given date or date range |
| `POST` | `/api/items` | Create new item |
| `PATCH` | `/api/items/:id` | Update item (including marking complete) |
| `DELETE` | `/api/items/:id` | Delete item |
| `GET` | `/api/items/week?start=` | Return all items for the current week (carousel calendar) |

> All routes require a valid `X-Session-Token` header. Unauthorized requests return `401`.

---

## 7. Key UX Flows

### 7.1 App Open — Returning User

```
App loads
  → Check localStorage for sessionToken
  → Token found → GET /api/session to validate
  → Check user.lastOpenedAt
      → Before 4:00 AM local time → show Intro Carousel (3 slides)
      → Carousel complete → update lastOpenedAt → show Home Screen
  → Token invalid / missing → First-Time Onboarding flow
```

### 7.2 Adding an Item

```
User taps "Add to MyDay"
  → Bottom sheet slides up, title field auto-focused
  → User fills type / date / priority / recurrence
  → Taps Save
      → Optimistic update to Zustand store
      → Home screen updates immediately (all 3 views)
      → POST /api/items fires in background
      → Success → toast confirmation
      → Error   → rollback store, show error toast
```

### 7.3 Completing a Task

```
User taps checkbox on item row
  → Strike-through animation plays (200 ms)
  → Item fades + moves to bottom of list (250 ms)
  → Optimistic completedAt written to store
  → PATCH /api/items/:id fires in background
  → Calendar strip day column count updates
  → Overview quip regenerates
```

---

## 8. Out of Scope (Post-MVP)

- External calendar integrations (Google Calendar, Apple Calendar, Outlook)
- Push / browser notifications and reminders
- Multi-device sync (requires migrating SQLite → PostgreSQL + cloud hosting)
- Collaboration / shared calendars
- AI-generated overview text (MVP uses template-based generation)
- File attachments on items
- Full OAuth authentication

---

## 9. MVP Development Milestones

| # | Milestone | Scope |
|---|-----------|-------|
| M1 | **Foundation** | Next.js + Tailwind + shadcn scaffold, Prisma schema, SQLite, session API, local session flow |
| M2 | **Data Layer** | Full CRUD API routes for items, Zustand store, SWR integration, recurrence expansion logic |
| M3 | **Home Screen** | Calendar strip, Overview section, To-Do Today list, Add Item bottom sheet — all wired to live data |
| M4 | **Intro Carousel** | Three-slide carousel (Header, Daily Overview, Week Ahead), first-time onboarding tour, `lastOpenedAt` gate |
| M5 | **Design Polish** | Obsidian theme (dark + light), Instrument Serif + Geist Mono typography, category/priority color system, Framer Motion animations |
| M6 | **QA & Responsive** | Mobile breakpoint testing (375 px, 768 px), edge cases (empty state, first day, recurrence), performance profiling |

---

*MyDay PRD · Version 1.0 · February 2026 · Living document — update as decisions are made.*
