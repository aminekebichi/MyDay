---
trigger: always_on
---

# MyDay — Design System
# Activation: Always On
# Read before generating any styled component, color value, or animation.
# Last updated: February 2026

---

## Theming

Always use CSS custom properties — never hardcode hex values in component files.
Tokens are defined in `globals.css` and toggled via `data-theme` on `<html>`.

### Dark Mode (default)
```css
--bg-base:      #1E1E2E;
--bg-surface:   #27273A;
--bg-elevated:  #313145;
--text-primary: #CDD6F4;
--text-muted:   #7F849C;
--accent:       #7C3AED;
--border:       #45475A;
```

### Light Mode (`data-theme="light"`)
```css
--bg-base:      #FAFAF8;
--bg-surface:   #F1F0EC;
--bg-elevated:  #FFFFFF;
--text-primary: #1E1E2E;
--text-muted:   #6C6C80;
--accent:       #5B21B6;
--border:       #D9D7D0;
```

---

## Category Colors

Muted — used as left-border stripe + faint background tint on item rows.
Never use bright or fully saturated colors. The palette is intentionally muted.

```ts
export const CATEGORY_COLORS = {
  TASK:       { dark: '#4A4A8A', light: '#6B6BAA' },
  ASSIGNMENT: { dark: '#6A4A2A', light: '#8B6A4A' },
  EVENT:      { dark: '#2A5A4A', light: '#3A7A6A' },
  MEETING:    { dark: '#2A4A6A', light: '#3A6A8A' },
  DEADLINE:   { dark: '#6A2A2A', light: '#8A4A4A' },
} as const
```

---

## Priority Colors

Muted — used as left-accent indicator + priority badge.

```ts
export const PRIORITY_COLORS = {
  ROUTINE:   { dark: '#7F849C', light: '#9090AA' },
  IMPORTANT: { dark: '#A07A3A', light: '#B08040' },
  CRITICAL:  { dark: '#8A3A3A', light: '#9A4040' },
} as const
```

---

## Typography — Three Fonts, Three Roles

Load all three via `next/font/google` in `lib/fonts.ts`.

| Role | Font | Usage |
|---|---|---|
| Display / Headings | **Instrument Serif** | Logo, section headings, carousel slide titles |
| Body / Data | **Geist Mono** (light) | Item labels, metadata, timestamps, all UI body text |
| Personality | **Caveat** | Weekly overview quip, carousel tagline beneath logo, empty-state messages |

### Caveat Guidance

Warm, human-voice accent only.

**Good uses:** overview quip, carousel subtitle, empty-state copy.

**Never use Caveat for:** item titles, form labels, button text, timestamps, navigation, or any body text.

---

## Motion Specs

- **Carousel slides:** horizontal spring, 400 ms, Framer Motion
- **Bottom sheet:** slide-up from bottom, 300 ms ease-out, `AnimatePresence`
- **Task completion:** strike-through left→right (200 ms) → fade + translate to bottom (250 ms)
- **Calendar scroll:** native momentum, no custom easing
- **Theme toggle:** 200 ms CSS transition on all color tokens
- **Never block interaction with animation.** Motion is responsive, not decorative.
- Use `onAnimationComplete` for any post-animation logic — never `setTimeout`
- Wrap all Framer Motion animations in a `prefers-reduced-motion` check:

```ts
const prefersReducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches
```

---

## Design Rules Summary

- Use `var(--token-name)` for ALL colors — no hardcoded hex values in component files
- Category colors: left-border stripe + faint bg tint only
- Priority colors: left-accent indicator + badge only
- Never use color alone to convey meaning — always pair with a label or icon
- All text must meet WCAG AA contrast (4.5:1 normal, 3:1 large text)
- Theme toggle uses `data-theme` on `<html>` — not class-based or JS-driven per-component