---
trigger: manual
---

# MyDay — Item Model, Components & UX Flows
# Activation: Always On
# Read before implementing any feature, form, or item-related component.
# Last updated: February 2026

---

## Item Model

All items share one Prisma model. Field availability is enforced in the UI only.

| Field | Type | Notes |
|---|---|---|
| `id` | `string` (UUID) | Auto-generated |
| `userId` | `string` | FK to User |
| `title` | `string` | Required |
| `type` | `ItemType` enum | `TASK \| ASSIGNMENT \| EVENT \| MEETING \| DEADLINE` |
| `priority` | `Priority` enum | `ROUTINE \| IMPORTANT \| CRITICAL` |
| `date` | `DateTime` | Required |
| `startTime` | `DateTime?` | Meeting + Event only |
| `endTime` | `DateTime?` | Meeting + Event only |
| `location` | `string?` | Meeting + Event only |
| `joinUrl` | `string?` | Meeting only — plain URL, no SDK |
| `attendeeName` | `string?` | Meeting only |
| `recurrence` | `Recurrence` enum | `NONE \| DAILY \| WEEKLY \| MONTHLY` |
| `recurrenceEndDate` | `DateTime?` | Optional |
| `notes` | `string?` | All types |
| `completedAt` | `DateTime?` | Null until checked off |
| `createdAt` | `DateTime` | Auto-set |

---

## Per-Type Field Visibility (Add/Edit Sheet)

| Field | Task | Assignment | Event | Meeting | Deadline |
|---|---|---|---|---|---|
| Start / End Time | — | — | ✓ | ✓ | — |
| Location | — | — | ✓ | ✓ | — |
| Join URL | — | — | — | ✓ | — |
| Attendee Name | — | — | — | ✓ | — |

`joinUrl` renders as a tappable "Join" button: `window.open(joinUrl, '_blank')`.
No validation beyond basic URL format. No Zoom SDK or any third-party meeting library.

---

## Key UI Components & Expected Behavior

| Component | Location | Behavior |
|---|---|---|
| `CalendarStrip` | `components/home/` | Horizontal scroll, Mon–Sun, today elevated, past muted, "+N more" chip |
| `TodoToday` | `components/home/` | Sorted by priority then time, checkbox with strike-through + translate animation |
| `AddItemSheet` | `components/sheets/` | Slide-up from bottom, fields adapt to selected type per visibility table |
| `DayDetailSheet` | `components/sheets/` | Opens on calendar day tap, shows all items for that day |
| `ItemRow` | `components/shared/` | Category color left-border stripe, title, priority badge, checkbox |
| `PriorityBadge` | `components/shared/` | Muted color label — Routine / Important / Critical |
| `CarouselHeader` | `components/carousel/` | Full-screen logo, Caveat tagline, auto-advances after 1.5 s |
| `DailyOverviewSlide` | `components/carousel/` | Today's tasks + next meeting card, scrollable |
| `WeekAheadSlide` | `components/carousel/` | Calendar strip + Caveat quip + priority item list |

---

## User Flows

### App Open — Returning User
1. Check `localStorage` for `myday_session_token`
2. Token found → `GET /api/session` to validate
3. Check `user.lastOpenedAt` — if before 4:00 AM local time today → show Intro Carousel
4. Carousel dismissed → `PATCH user.lastOpenedAt` → render home screen
5. Token missing/invalid → render first-time onboarding tour

### Adding an Item
1. User taps "Add to MyDay" sticky button
2. `AddItemSheet` slides up (300 ms), title autofocused
3. User fills fields; type selector controls field visibility per table above
4. Save → optimistic Zustand update → `POST /api/items` in background
5. All three views update immediately; toast on success, rollback on error

### Completing a Task
1. Checkbox tapped → strike-through animates left→right (200 ms)
2. Item fades + translates to bottom of list (250 ms)
3. `PATCH /api/items/:id` fires with `completedAt: new Date().toISOString()`
4. Calendar strip day column count decrements; overview quip regenerates

---

## Session & Carousel Gate

- Token key in localStorage: `myday_session_token`
- Carousel fires when: session valid AND `user.lastOpenedAt` before 4:00 AM local today
- After dismissal: `PATCH user.lastOpenedAt` before home screen renders
- No token → onboarding tour (not carousel)

---

## Mockup Design Reference

Original hand-drawn mockups are in `docs/mockups/`. Key layouts:

- **Home screen:** Scrollable calendar strip at top (today elevated, past days hatched/muted) → Overview quip in Caveat font → To-Do Today checklist → sticky "Add to MyDay" pill button fixed to bottom
- **Daily Overview slide:** Full-screen logo (Instrument Serif), tagline in Caveat, task checklist with category + priority indicators, meeting contact card chip
- **Week Ahead slide:** Calendar strip → one-sentence Caveat quip → prioritized list of upcoming items
- **Add Item sheet:** Bottom sheet, type segmented control at top, context-sensitive fields below per visibility table
