---
trigger: manual
---

# MyDay — Scrum & GitHub Workflow
# Activation: Always On
# Read before generating any branch name, commit message, PR description, or issue reference.
# Last updated: February 2026

---

## Branch Naming

| Type | Format | Example |
|---|---|---|
| Feature | `feature/[issue-number]-[short-description]` | `feature/6-calendar-strip` |
| Bug fix | `fix/[issue-number]-[short-description]` | `fix/14-token-not-updating` |
| Chore | `chore/[issue-number]-[short-description]` | `chore/1-nextjs-scaffold` |

- Always branch off `main`. Never branch off another feature branch.

---

## Commit Message Format

```
Verb description (#issue-number)
```

- Present-tense imperative: "Add", "Fix", "Refactor", "Remove" — not "Added"
- Subject line under 72 characters
- Reference the GitHub Issue number in every commit

### Examples
```
Add scrollable calendar strip component (#6)
Fix optimistic rollback on item delete (#8)
Refactor Zustand store slice for items (#5)
```

---

## Pull Request Workflow

### PR Title Format
`[Issue title] (#issue-number)`

### PR Body Must Include
- `Closes #[issue-number]` to auto-close on merge
- Brief summary of what changed and why
- Screenshots for any UI changes

### Self-Review Checklist Before Requesting Review
- [ ] `npm run dev` runs without errors
- [ ] `npm run lint` passes clean
- [ ] `npm run test` passes
- [ ] No hardcoded hex values introduced
- [ ] No `any` types introduced
- [ ] Optimistic updates implemented for any mutations
- [ ] Accessible: tap targets ≥44px, keyboard navigable, ARIA labels present
- [ ] Responsive at 375 px and 768 px

### Board Movement
- Move the GitHub Issue to **In Review** when the PR is opened
- Move to **Done** only after merge to `main`
- Commit rules file changes in their own PR so convention changes are explicitly reviewed

---

## Referencing Issues in Code

Add a comment above any function implementing a GitHub Issue:

```ts
// Implements #6: scrollable weekly calendar strip
export function CalendarStrip() { ... }

// TODO(#12): add Zod validation to this route
```

---

## AI Workflow Instructions

When implementing a feature, always:

1. Confirm which GitHub Issue this maps to before writing any code
2. Follow the folder structure in `01-project-overview.md` exactly
3. Name the branch per the convention above before generating any files
4. Reference the relevant PRD section before generating components
5. Check the Per-Type Field Visibility table in `02-item-model-and-ux.md` before generating any form or item component
6. Never implement anything in the Out of Scope section
