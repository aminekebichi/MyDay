---
trigger: manual
---

# MyDay — Coding Standards, Patterns & Testing
# Activation: Always On
# Read before writing any code, hook, API route, or test.
# Last updated: February 2026

---

## Naming Conventions

- **Components:** PascalCase, one component per file, filename matches component name
- **Hooks:** camelCase prefixed with `use` (e.g., `useWeekItems`)
- **API routes:** kebab-case folder names
- **DB columns:** snake_case (handled by Prisma automatically)
- **CSS variables:** kebab-case prefixed with `--` (e.g., `--bg-base`, `--text-muted`)
- **Zustand slices:** one object per domain, co-located in `lib/store.ts` for MVP
- **Enum values:** `SCREAMING_SNAKE_CASE` matching Prisma enums
- **Type vs interface:** prefer `type` for data shapes; use `interface` only for class contracts

---

## TypeScript Standards

- Strict mode on. **No `any`, no `// @ts-ignore`.**
- Use `unknown` + type guards if type is genuinely uncertain
- Zod schemas in `lib/schemas.ts` for all API bodies
- Export type-guard helpers: `isEvent(item)`, `isMeeting(item)`, etc.
- Reference GitHub Issue in code above every implementing function:
  ```ts
  // Implements #6: scrollable weekly calendar strip
  export function CalendarStrip() { ... }

  // TODO(#12): add Zod validation to this route
  ```

---

## React & Next.js Patterns

- **Server Components by default.** `"use client"` only when truly needed (event handlers, hooks, animations). Never add it to `page.tsx` or `layout.tsx`.
- **Data via SWR hooks** in `hooks/` — never fetch directly in components.
- **Prisma only in API routes** — never in components or Server Components.
- **All forms:** controlled inputs only, no uncontrolled refs.
- **Bottom sheets** portaled via Framer Motion `AnimatePresence`.
- **Never fetch user-specific data inside Server Components.**

---

## State Management

- Zustand store holds: `items[]`, `sessionUser`, `theme`, `isCarouselDismissed`
- **Every mutation:** optimistic store update → API call → rollback on error + error toast
- Overview quip is a derived value from `items[]` — never stored separately

---

## API Route Patterns

- Validate `X-Session-Token` first via `validateSession(req)` from `lib/session.ts` — do not inline this logic
- Return `401` if token is missing or invalid
- Consistent error shape: `{ error: string, code: string }`
- Zod-parse all request bodies; return `400` on validation failure
- Prisma only — **no raw SQL ever**

---

## Accessibility Requirements (Non-Negotiable)

Every component must meet all of these:

- **Minimum tap target size:** 44 × 44 px for all interactive elements (WCAG 2.5.5)
- **Color contrast:** WCAG AA — 4.5:1 normal text, 3:1 large text. Never use color alone to convey meaning.
- **Keyboard navigation:** all interactive elements reachable and operable via keyboard. Use native `<button>` and `<a>` — never `<div onClick>`.
- **Focus management:** when a sheet opens, move focus to first focusable element. When it closes, return focus to the trigger.
- **ARIA labels:** icon-only buttons must have `aria-label`. Carousel must have `role="region"` and `aria-label`. Progress dots must have `aria-label="Slide N of M"`.
- **Semantic HTML:** use `<nav>`, `<main>`, `<section>`, `<ul>/<li>`, `<time>`. No structural `<div>` substitutes.
- **Reduced motion:** wrap all Framer Motion animations in `prefers-reduced-motion` check.
- **Test selectors:** use `getByRole` / `getByLabelText` — not `getByTestId`.

---

## Testing Strategy

- **Framework:** Vitest + React Testing Library
- **Test file location:** co-located with source files as `*.test.ts` / `*.test.tsx`
- **Coverage goals:** 70% line coverage for `lib/` utilities; 50% for components

### Patterns
- Unit test all `lib/` helpers (recurrence expansion, overviewQuip, session validation)
- Integration test API routes using `next-test-api-route-handler` or similar
- Component tests assert behavior, not implementation — click, render, assert
- Mock Prisma using `vitest` `vi.mock` or `jest-mock-extended`
- Never test internal state or private methods
- Use `getByRole` and `getByLabelText` — not `getByTestId` — wherever possible

### Run Commands
```bash
npm run test          # Run once
npm run test:watch    # Watch mode
```

---

## Do's and Don'ts

### Do
- Use `var(--token-name)` for all colors
- Use `date-fns` for all date arithmetic
- Use Zod schemas for all API validation
- Use `isEvent(item)` / `isMeeting(item)` type guards in components
- Use `getByRole` / `getByLabelText` in tests
- Use `AnimatePresence` for sheet enter/exit
- Use `onAnimationComplete` for post-animation logic
- Use native `<button>` and `<a>` for all interactive elements
- Add `aria-label` to all icon-only buttons
- Wrap animations in `prefers-reduced-motion` check
- Reference the GitHub Issue number in every commit and above every implementing function

### Don't
- Hardcode hex values in component files
- Add `"use client"` to `page.tsx` or `layout.tsx`
- Write recurring item rows to the DB
- Use `new Date()` arithmetic directly
- Suggest third-party integrations (Google Calendar, Zoom SDK, Outlook, etc.)
- Add auth beyond local session (no NextAuth, no Clerk, no OAuth)
- Skip optimistic updates on any mutation
- Apply Caveat font to labels, navigation, or body text
- Fetch user-specific data inside Server Components
- Use `setTimeout` for animation timing — use `onAnimationComplete`
- Use `<div onClick>` instead of `<button>`
- Use `getByTestId` when a role selector is available
