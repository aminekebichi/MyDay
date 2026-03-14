const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

// Sprint context (today = 2026-03-13, Friday)
// Sprint 1 execution:  Mon Mar 9  – Fri Mar 13  (issues #1–#8, #11, #12)
// Sprint 2 kickoff:    Mon Mar 16 – Fri Mar 20  (issues #9, #10, #13, #14, #15)
//
// Users
//   Amine  — Frontend engineer  (#4 onboarding, #5 Zustand, #6 calendar strip, #7 todo, #9 quip)
//   Sarah  — Designer / frontend (#8 add sheet, #10 theme, #11 carousel, #14 typography, #15 QA)
//   Bob    — Backend / infra     (#1 scaffold, #2 Prisma, #3 session API, #12 CRUD, #13 recurrence)
//   Admin  — Engineering manager (ceremonies, 1:1s, reviews, stakeholder comms)

function d(date, time) {
    // Use noon UTC for date-only values so local-time date math lands on the
    // correct calendar day in any timezone (UTC-12 to UTC+12).
    return time
        ? new Date(`${date}T${time}:00.000Z`)
        : new Date(`${date}T12:00:00.000Z`);
}

async function main() {
    console.log('Wiping database...');
    await prisma.item.deleteMany({});
    await prisma.user.deleteMany({});

    console.log('Creating users...');
    await prisma.user.createMany({
        data: [
            { id: 'usr_amine_123', displayName: 'Amine',         username: 'amine', passwordHash: bcrypt.hashSync('amine', 10), role: 'USER'  },
            { id: 'usr_sarah_123', displayName: 'Sarah',          username: 'sarah', passwordHash: bcrypt.hashSync('sarah', 10), role: 'USER'  },
            { id: 'usr_bob_123',   displayName: 'Bob',            username: 'bob',   passwordHash: bcrypt.hashSync('bob',   10), role: 'USER'  },
            { id: 'usr_admin_123', displayName: 'Administrator',  username: 'admin', passwordHash: bcrypt.hashSync('admin', 10), role: 'ADMIN' },
        ],
    });

    console.log('Seeding sprint items...');

    // ══════════════════════════════════════════════════════════════════
    // AMINE — Frontend Engineer
    // Sprint 1: Zustand store (#5), CalendarStrip (#6), TodoToday (#7), Onboarding tour (#4)
    // Sprint 2: Weekly overview quip (#9), recurrence UI (#13), mobile QA (#15)
    // ══════════════════════════════════════════════════════════════════
    await prisma.item.createMany({ data: [
        // ── Mon Mar 9 ──
        {
            userId: 'usr_amine_123',
            title: 'Sprint 1 planning',
            type: 'MEETING', priority: 'IMPORTANT',
            date: d('2026-03-09'),
            startTime: d('2026-03-09', '13:00'), endTime: d('2026-03-09', '14:30'),
            attendeeName: 'Full team',
            notes: 'Story point estimation for #4, #5, #6, #7, #8, #11, #12. Amine owns #4, #5, #6, #7',
        },
        {
            userId: 'usr_amine_123',
            title: 'Implement Zustand store — items & session slices (#5)',
            type: 'TASK', priority: 'CRITICAL',
            date: d('2026-03-09'),
            notes: 'Create store.ts with setItems, addItem, updateItem, deleteItem, login, logout slices. Persist session only.',
            completedAt: new Date('2026-03-09T22:00:00.000Z'),
        },
        // ── Tue Mar 10 ──
        {
            userId: 'usr_amine_123',
            title: 'Daily standup',
            type: 'MEETING', priority: 'ROUTINE',
            date: d('2026-03-10'),
            startTime: d('2026-03-10', '13:15'), endTime: d('2026-03-10', '13:30'),
            attendeeName: 'Full team',
        },
        {
            userId: 'usr_amine_123',
            title: 'Build scrollable CalendarStrip component (#6)',
            type: 'TASK', priority: 'IMPORTANT',
            date: d('2026-03-10'),
            notes: 'Horizontal scroll, day cards, today highlight, item dots. Implements #6. Read from Zustand store.',
        },
        // ── Wed Mar 11 ──
        {
            userId: 'usr_amine_123',
            title: 'Daily standup',
            type: 'MEETING', priority: 'ROUTINE',
            date: d('2026-03-11'),
            startTime: d('2026-03-11', '13:15'), endTime: d('2026-03-11', '13:30'),
            attendeeName: 'Full team',
        },
        {
            userId: 'usr_amine_123',
            title: 'Build TodoToday list with checkbox completion (#7)',
            type: 'TASK', priority: 'IMPORTANT',
            date: d('2026-03-11'),
            notes: 'Filter items by selectedDate, optimistic PATCH on check. Implements #7.',
        },
        // ── Thu Mar 12 ──
        {
            userId: 'usr_amine_123',
            title: 'Daily standup',
            type: 'MEETING', priority: 'ROUTINE',
            date: d('2026-03-12'),
            startTime: d('2026-03-12', '13:15'), endTime: d('2026-03-12', '13:30'),
            attendeeName: 'Full team',
        },
        {
            userId: 'usr_amine_123',
            title: 'Build first-time onboarding tour (#4)',
            type: 'TASK', priority: 'IMPORTANT',
            date: d('2026-03-12'),
            notes: '3-step carousel gate: Welcome → Feature Tour → Profile Setup. Show when no session token. Implements #4.',
        },
        // ── Fri Mar 13 ──
        {
            userId: 'usr_amine_123',
            title: 'Daily standup',
            type: 'MEETING', priority: 'ROUTINE',
            date: d('2026-03-13'),
            startTime: d('2026-03-13', '13:15'), endTime: d('2026-03-13', '13:30'),
            attendeeName: 'Full team',
        },
        {
            userId: 'usr_amine_123',
            title: 'Ship PRs for #4, #6, #7 — sprint 1 deadline',
            type: 'DEADLINE', priority: 'CRITICAL',
            date: d('2026-03-13'),
            notes: 'Open PRs, request review from Bob. All must be mergeable by 3 PM.',
        },
        {
            userId: 'usr_amine_123',
            title: 'Sprint 1 review & demo',
            type: 'EVENT', priority: 'IMPORTANT',
            date: d('2026-03-13'),
            startTime: d('2026-03-13', '19:00'), endTime: d('2026-03-13', '20:00'),
            attendeeName: 'Full team + stakeholders',
            notes: 'Demo CalendarStrip, TodoToday, and onboarding tour',
        },
        // ── Mon Mar 16 ──
        {
            userId: 'usr_amine_123',
            title: 'Sprint 2 planning',
            type: 'MEETING', priority: 'IMPORTANT',
            date: d('2026-03-16'),
            startTime: d('2026-03-16', '13:00'), endTime: d('2026-03-16', '14:30'),
            attendeeName: 'Full team',
            notes: 'Sprint 2 scope: #9, #10, #13, #14, #15. Amine owns #9 and recurrence UI portion of #13.',
        },
        {
            userId: 'usr_amine_123',
            title: 'Implement weekly overview quip generator (#9)',
            type: 'TASK', priority: 'IMPORTANT',
            date: d('2026-03-16'),
            notes: 'Template-based, no AI. Reads from store, outputs summary string. Implements #9.',
        },
        // ── Tue Mar 17 ──
        {
            userId: 'usr_amine_123',
            title: 'Daily standup',
            type: 'MEETING', priority: 'ROUTINE',
            date: d('2026-03-17'),
            startTime: d('2026-03-17', '13:15'), endTime: d('2026-03-17', '13:30'),
            attendeeName: 'Full team',
        },
        {
            userId: 'usr_amine_123',
            title: 'Integrate recurrence expansion into CalendarStrip (#13)',
            type: 'TASK', priority: 'IMPORTANT',
            date: d('2026-03-17'),
            notes: 'Consume virtual items from GET /api/items/week. Dot indicators must reflect recurring instances.',
        },
        // ── Wed Mar 18 ──
        {
            userId: 'usr_amine_123',
            title: 'Daily standup',
            type: 'MEETING', priority: 'ROUTINE',
            date: d('2026-03-18'),
            startTime: d('2026-03-18', '13:15'), endTime: d('2026-03-18', '13:30'),
            attendeeName: 'Full team',
        },
        {
            userId: 'usr_amine_123',
            title: 'Wire up light/dark theme toggle (#10)',
            type: 'TASK', priority: 'IMPORTANT',
            date: d('2026-03-18'),
            notes: 'Read theme from store, toggle data-theme on <html>. Persist to localStorage. Implements #10 frontend side.',
        },
        // ── Thu Mar 19 ──
        {
            userId: 'usr_amine_123',
            title: 'Daily standup',
            type: 'MEETING', priority: 'ROUTINE',
            date: d('2026-03-19'),
            startTime: d('2026-03-19', '13:15'), endTime: d('2026-03-19', '13:30'),
            attendeeName: 'Full team',
        },
        {
            userId: 'usr_amine_123',
            title: 'Mobile responsive QA — 375px breakpoint (#15)',
            type: 'TASK', priority: 'IMPORTANT',
            date: d('2026-03-19'),
            notes: 'Test CalendarStrip, TodoToday, AddItemSheet at 375px. File bugs for anything broken.',
        },
        // ── Fri Mar 20 ──
        {
            userId: 'usr_amine_123',
            title: 'Daily standup',
            type: 'MEETING', priority: 'ROUTINE',
            date: d('2026-03-20'),
            startTime: d('2026-03-20', '13:15'), endTime: d('2026-03-20', '13:30'),
            attendeeName: 'Full team',
        },
        {
            userId: 'usr_amine_123',
            title: 'Sprint 2 review & demo',
            type: 'EVENT', priority: 'IMPORTANT',
            date: d('2026-03-20'),
            startTime: d('2026-03-20', '19:00'), endTime: d('2026-03-20', '20:00'),
            attendeeName: 'Full team + stakeholders',
            notes: 'Demo quip generator, recurrence, theme toggle',
        },
        {
            userId: 'usr_amine_123',
            title: 'Sprint 2 retrospective',
            type: 'MEETING', priority: 'ROUTINE',
            date: d('2026-03-20'),
            startTime: d('2026-03-20', '20:00'), endTime: d('2026-03-20', '21:00'),
            attendeeName: 'Full team',
        },
    ]});

    // ══════════════════════════════════════════════════════════════════
    // SARAH — Designer / Frontend
    // Sprint 1: AddItemSheet (#8), Intro carousel (#11)
    // Sprint 2: Theme toggle CSS/design (#10), Typography system (#14), Mobile QA (#15)
    // ══════════════════════════════════════════════════════════════════
    await prisma.item.createMany({ data: [
        // ── Mon Mar 9 ──
        {
            userId: 'usr_sarah_123',
            title: 'Sprint 1 planning',
            type: 'MEETING', priority: 'IMPORTANT',
            date: d('2026-03-09'),
            startTime: d('2026-03-09', '13:00'), endTime: d('2026-03-09', '14:30'),
            attendeeName: 'Full team',
            notes: 'Sarah owns #8 (Add Item sheet) and #11 (intro carousel)',
        },
        {
            userId: 'usr_sarah_123',
            title: 'Design AddItemSheet — wireframes & field visibility logic (#8)',
            type: 'TASK', priority: 'IMPORTANT',
            date: d('2026-03-09'),
            notes: 'Per-type fields: MEETING shows attendeeName/joinUrl; EVENT shows location; DEADLINE hides time fields. Figma first.',
        },
        // ── Tue Mar 10 ──
        {
            userId: 'usr_sarah_123',
            title: 'Daily standup',
            type: 'MEETING', priority: 'ROUTINE',
            date: d('2026-03-10'),
            startTime: d('2026-03-10', '13:15'), endTime: d('2026-03-10', '13:30'),
            attendeeName: 'Full team',
        },
        {
            userId: 'usr_sarah_123',
            title: 'Build AddItemSheet component (#8)',
            type: 'TASK', priority: 'IMPORTANT',
            date: d('2026-03-10'),
            notes: 'Bottom sheet with Framer Motion slide-up. Zod validation, optimistic addItem on submit. Implements #8.',
        },
        // ── Wed Mar 11 ──
        {
            userId: 'usr_sarah_123',
            title: 'Daily standup',
            type: 'MEETING', priority: 'ROUTINE',
            date: d('2026-03-11'),
            startTime: d('2026-03-11', '13:15'), endTime: d('2026-03-11', '13:30'),
            attendeeName: 'Full team',
        },
        {
            userId: 'usr_sarah_123',
            title: 'Design & build intro carousel slides (#11)',
            type: 'TASK', priority: 'IMPORTANT',
            date: d('2026-03-11'),
            notes: '3 slides: DailyOverviewSlide, WeekAheadSlide, + welcome. Caveat tagline, coral accent. Implements #11.',
        },
        // ── Thu Mar 12 ──
        {
            userId: 'usr_sarah_123',
            title: 'Daily standup',
            type: 'MEETING', priority: 'ROUTINE',
            date: d('2026-03-12'),
            startTime: d('2026-03-12', '13:15'), endTime: d('2026-03-12', '13:30'),
            attendeeName: 'Full team',
        },
        {
            userId: 'usr_sarah_123',
            title: 'AddItemSheet & carousel code review with Amine',
            type: 'MEETING', priority: 'ROUTINE',
            date: d('2026-03-12'),
            startTime: d('2026-03-12', '17:00'), endTime: d('2026-03-12', '17:45'),
            attendeeName: 'Amine',
            notes: 'Walk through field visibility logic and carousel gate conditions',
        },
        // ── Fri Mar 13 ──
        {
            userId: 'usr_sarah_123',
            title: 'Daily standup',
            type: 'MEETING', priority: 'ROUTINE',
            date: d('2026-03-13'),
            startTime: d('2026-03-13', '13:15'), endTime: d('2026-03-13', '13:30'),
            attendeeName: 'Full team',
        },
        {
            userId: 'usr_sarah_123',
            title: 'Ship PRs for #8 and #11 — sprint 1 deadline',
            type: 'DEADLINE', priority: 'CRITICAL',
            date: d('2026-03-13'),
            notes: 'AddItemSheet and intro carousel must be merged before the demo at 3 PM',
        },
        {
            userId: 'usr_sarah_123',
            title: 'Sprint 1 review & demo',
            type: 'EVENT', priority: 'IMPORTANT',
            date: d('2026-03-13'),
            startTime: d('2026-03-13', '19:00'), endTime: d('2026-03-13', '20:00'),
            attendeeName: 'Full team + stakeholders',
            notes: 'Sarah demos AddItemSheet and carousel flow',
        },
        // ── Mon Mar 16 ──
        {
            userId: 'usr_sarah_123',
            title: 'Sprint 2 planning',
            type: 'MEETING', priority: 'IMPORTANT',
            date: d('2026-03-16'),
            startTime: d('2026-03-16', '13:00'), endTime: d('2026-03-16', '14:30'),
            attendeeName: 'Full team',
            notes: 'Sarah owns #10 (theme toggle CSS), #14 (typography), and #15 (mobile QA)',
        },
        {
            userId: 'usr_sarah_123',
            title: 'Implement light/dark theme toggle — CSS tokens & globals.css (#10)',
            type: 'TASK', priority: 'IMPORTANT',
            date: d('2026-03-16'),
            notes: 'Define all --bg-*, --text-*, --accent, --border tokens for both themes. data-theme on <html>. Implements #10 design side.',
        },
        // ── Tue Mar 17 ──
        {
            userId: 'usr_sarah_123',
            title: 'Daily standup',
            type: 'MEETING', priority: 'ROUTINE',
            date: d('2026-03-17'),
            startTime: d('2026-03-17', '13:15'), endTime: d('2026-03-17', '13:30'),
            attendeeName: 'Full team',
        },
        {
            userId: 'usr_sarah_123',
            title: 'Apply full typography system (#14)',
            type: 'TASK', priority: 'IMPORTANT',
            date: d('2026-03-17'),
            notes: 'Instrument Serif → headings/logo, Geist Mono → body/labels, Caveat → quips/carousel tagline only. Implements #14.',
        },
        // ── Wed Mar 18 ──
        {
            userId: 'usr_sarah_123',
            title: 'Daily standup',
            type: 'MEETING', priority: 'ROUTINE',
            date: d('2026-03-18'),
            startTime: d('2026-03-18', '13:15'), endTime: d('2026-03-18', '13:30'),
            attendeeName: 'Full team',
        },
        {
            userId: 'usr_sarah_123',
            title: 'Design QA pass — all components against token spec',
            type: 'TASK', priority: 'ROUTINE',
            date: d('2026-03-18'),
            notes: 'Audit every component: no hardcoded hex values, correct font classes, correct CSS vars. File issues for violations.',
        },
        // ── Thu Mar 19 ──
        {
            userId: 'usr_sarah_123',
            title: 'Daily standup',
            type: 'MEETING', priority: 'ROUTINE',
            date: d('2026-03-19'),
            startTime: d('2026-03-19', '13:15'), endTime: d('2026-03-19', '13:30'),
            attendeeName: 'Full team',
        },
        {
            userId: 'usr_sarah_123',
            title: 'Mobile responsive QA — 768px breakpoint (#15)',
            type: 'TASK', priority: 'IMPORTANT',
            date: d('2026-03-19'),
            notes: 'Test all screens at 768px tablet. Focus on AddItemSheet, OverviewSection, CalendarStrip card widths.',
        },
        // ── Fri Mar 20 ──
        {
            userId: 'usr_sarah_123',
            title: 'Daily standup',
            type: 'MEETING', priority: 'ROUTINE',
            date: d('2026-03-20'),
            startTime: d('2026-03-20', '13:15'), endTime: d('2026-03-20', '13:30'),
            attendeeName: 'Full team',
        },
        {
            userId: 'usr_sarah_123',
            title: 'Ship PRs for #10, #14 — sprint 2 deadline',
            type: 'DEADLINE', priority: 'CRITICAL',
            date: d('2026-03-20'),
            notes: 'Theme tokens and typography system merged before 3 PM demo',
        },
        {
            userId: 'usr_sarah_123',
            title: 'Sprint 2 review & demo',
            type: 'EVENT', priority: 'IMPORTANT',
            date: d('2026-03-20'),
            startTime: d('2026-03-20', '19:00'), endTime: d('2026-03-20', '20:00'),
            attendeeName: 'Full team + stakeholders',
            notes: 'Sarah demos theme toggle and typography across all screens',
        },
    ]});

    // ══════════════════════════════════════════════════════════════════
    // BOB — Backend / Infra Engineer
    // Sprint 1: Next.js scaffold (#1 done), Prisma schema (#2), session API (#3), CRUD routes (#12)
    // Sprint 2: Recurrence expansion logic (#13), API integration tests, performance
    // ══════════════════════════════════════════════════════════════════
    await prisma.item.createMany({ data: [
        // ── Mon Mar 9 ──
        {
            userId: 'usr_bob_123',
            title: 'Sprint 1 planning',
            type: 'MEETING', priority: 'IMPORTANT',
            date: d('2026-03-09'),
            startTime: d('2026-03-09', '13:00'), endTime: d('2026-03-09', '14:30'),
            attendeeName: 'Full team',
            notes: 'Bob owns #2 (Prisma schema), #3 (session API), #12 (CRUD routes). #1 scaffold already merged.',
        },
        {
            userId: 'usr_bob_123',
            title: 'Configure Prisma schema & SQLite DB (#2)',
            type: 'TASK', priority: 'CRITICAL',
            date: d('2026-03-09'),
            notes: 'User + Item models, all field types, relations. npx prisma migrate dev --name init. Implements #2.',
            completedAt: new Date('2026-03-09T21:00:00.000Z'),
        },
        // ── Tue Mar 10 ──
        {
            userId: 'usr_bob_123',
            title: 'Daily standup',
            type: 'MEETING', priority: 'ROUTINE',
            date: d('2026-03-10'),
            startTime: d('2026-03-10', '13:15'), endTime: d('2026-03-10', '13:30'),
            attendeeName: 'Full team',
        },
        {
            userId: 'usr_bob_123',
            title: 'Implement local session API — POST & GET /api/session (#3)',
            type: 'TASK', priority: 'CRITICAL',
            date: d('2026-03-10'),
            notes: 'UUID token, myday_session_token in localStorage, X-Session-Token header, validateSession() helper. Implements #3.',
            completedAt: new Date('2026-03-10T22:30:00.000Z'),
        },
        // ── Wed Mar 11 ──
        {
            userId: 'usr_bob_123',
            title: 'Daily standup',
            type: 'MEETING', priority: 'ROUTINE',
            date: d('2026-03-11'),
            startTime: d('2026-03-11', '13:15'), endTime: d('2026-03-11', '13:30'),
            attendeeName: 'Full team',
        },
        {
            userId: 'usr_bob_123',
            title: 'Implement CRUD API routes for items (#12)',
            type: 'TASK', priority: 'CRITICAL',
            date: d('2026-03-11'),
            notes: 'GET+POST /api/items, PATCH+DELETE /api/items/:id, GET /api/items/week. All must call validateSession(). Implements #12.',
        },
        // ── Thu Mar 12 ──
        {
            userId: 'usr_bob_123',
            title: 'Daily standup',
            type: 'MEETING', priority: 'ROUTINE',
            date: d('2026-03-12'),
            startTime: d('2026-03-12', '13:15'), endTime: d('2026-03-12', '13:30'),
            attendeeName: 'Full team',
        },
        {
            userId: 'usr_bob_123',
            title: 'Code review — Amine\'s PRs (#4, #6, #7)',
            type: 'TASK', priority: 'ROUTINE',
            date: d('2026-03-12'),
            notes: 'Check: no direct DB writes in components, optimistic update rollback present, validateSession called on mutations',
        },
        // ── Fri Mar 13 ──
        {
            userId: 'usr_bob_123',
            title: 'Daily standup',
            type: 'MEETING', priority: 'ROUTINE',
            date: d('2026-03-13'),
            startTime: d('2026-03-13', '13:15'), endTime: d('2026-03-13', '13:30'),
            attendeeName: 'Full team',
        },
        {
            userId: 'usr_bob_123',
            title: 'Ship PR for #12 (CRUD routes) — sprint 1 deadline',
            type: 'DEADLINE', priority: 'CRITICAL',
            date: d('2026-03-13'),
            notes: 'All 5 API routes merged and passing CI before 3 PM demo',
        },
        {
            userId: 'usr_bob_123',
            title: 'Sprint 1 review & demo',
            type: 'EVENT', priority: 'IMPORTANT',
            date: d('2026-03-13'),
            startTime: d('2026-03-13', '19:00'), endTime: d('2026-03-13', '20:00'),
            attendeeName: 'Full team + stakeholders',
            notes: 'Bob demos session API and CRUD routes via Postman + curl',
        },
        // ── Mon Mar 16 ──
        {
            userId: 'usr_bob_123',
            title: 'Sprint 2 planning',
            type: 'MEETING', priority: 'IMPORTANT',
            date: d('2026-03-16'),
            startTime: d('2026-03-16', '13:00'), endTime: d('2026-03-16', '14:30'),
            attendeeName: 'Full team',
            notes: 'Bob owns #13 (recurrence expansion at read time) and integration test coverage',
        },
        {
            userId: 'usr_bob_123',
            title: 'Implement recurrence expansion logic at read time (#13)',
            type: 'TASK', priority: 'CRITICAL',
            date: d('2026-03-16'),
            notes: 'Store only base item + rule. Expand DAILY/WEEKLY/MONTHLY into virtual items in GET /api/items/week. Implements #13.',
        },
        // ── Tue Mar 17 ──
        {
            userId: 'usr_bob_123',
            title: 'Daily standup',
            type: 'MEETING', priority: 'ROUTINE',
            date: d('2026-03-17'),
            startTime: d('2026-03-17', '13:15'), endTime: d('2026-03-17', '13:30'),
            attendeeName: 'Full team',
        },
        {
            userId: 'usr_bob_123',
            title: 'Write integration tests for all API routes',
            type: 'TASK', priority: 'IMPORTANT',
            date: d('2026-03-17'),
            notes: 'Vitest + mock Prisma. Cover: 401 on missing token, 400 on bad body, 200 happy paths for all 5 routes.',
        },
        // ── Wed Mar 18 ──
        {
            userId: 'usr_bob_123',
            title: 'Daily standup',
            type: 'MEETING', priority: 'ROUTINE',
            date: d('2026-03-18'),
            startTime: d('2026-03-18', '13:15'), endTime: d('2026-03-18', '13:30'),
            attendeeName: 'Full team',
        },
        {
            userId: 'usr_bob_123',
            title: 'Performance: add DB indexes for date + userId queries',
            type: 'TASK', priority: 'IMPORTANT',
            date: d('2026-03-18'),
            notes: 'GET /api/items/week scanning full table — add composite index. Target < 50ms on 10k rows.',
        },
        // ── Thu Mar 19 ──
        {
            userId: 'usr_bob_123',
            title: 'Daily standup',
            type: 'MEETING', priority: 'ROUTINE',
            date: d('2026-03-19'),
            startTime: d('2026-03-19', '13:15'), endTime: d('2026-03-19', '13:30'),
            attendeeName: 'Full team',
        },
        {
            userId: 'usr_bob_123',
            title: 'Code review — Sarah\'s theme & typography PRs (#10, #14)',
            type: 'TASK', priority: 'ROUTINE',
            date: d('2026-03-19'),
            notes: 'Check: no hardcoded hex in component files, all tokens use var(--token-name), dark mode tested',
        },
        // ── Fri Mar 20 ──
        {
            userId: 'usr_bob_123',
            title: 'Daily standup',
            type: 'MEETING', priority: 'ROUTINE',
            date: d('2026-03-20'),
            startTime: d('2026-03-20', '13:15'), endTime: d('2026-03-20', '13:30'),
            attendeeName: 'Full team',
        },
        {
            userId: 'usr_bob_123',
            title: 'Ship PR for #13 (recurrence) — sprint 2 deadline',
            type: 'DEADLINE', priority: 'CRITICAL',
            date: d('2026-03-20'),
            notes: 'Recurrence expansion logic + tests merged before 3 PM demo. 80%+ coverage required.',
        },
        {
            userId: 'usr_bob_123',
            title: 'Sprint 2 review & demo',
            type: 'EVENT', priority: 'IMPORTANT',
            date: d('2026-03-20'),
            startTime: d('2026-03-20', '19:00'), endTime: d('2026-03-20', '20:00'),
            attendeeName: 'Full team + stakeholders',
            notes: 'Bob demos recurrence expansion with live WEEKLY item repeating across 3 weeks',
        },
    ]});

    // ══════════════════════════════════════════════════════════════════
    // ADMIN — Engineering Manager
    // Runs ceremonies, 1:1s, tracks issue progress, stakeholder comms
    // ══════════════════════════════════════════════════════════════════
    await prisma.item.createMany({ data: [
        // ── Mon Mar 9 ──
        {
            userId: 'usr_admin_123',
            title: 'Sprint 1 planning — facilitate',
            type: 'MEETING', priority: 'IMPORTANT',
            date: d('2026-03-09'),
            startTime: d('2026-03-09', '13:00'), endTime: d('2026-03-09', '14:30'),
            attendeeName: 'Full team',
            notes: 'Prep: print backlog with estimates. Target velocity: 10 story points. Issues #3–#8, #11, #12 in scope.',
        },
        {
            userId: 'usr_admin_123',
            title: 'Review sprint board & assign issues (#3–#12)',
            type: 'TASK', priority: 'IMPORTANT',
            date: d('2026-03-09'),
            notes: 'Amine → #4,#5,#6,#7 | Sarah → #8,#11 | Bob → #2,#3,#12. Update GitHub issue assignees.',
            completedAt: new Date('2026-03-09T15:00:00.000Z'),
        },
        // ── Tue Mar 10 ──
        {
            userId: 'usr_admin_123',
            title: 'Daily standup',
            type: 'MEETING', priority: 'ROUTINE',
            date: d('2026-03-10'),
            startTime: d('2026-03-10', '13:15'), endTime: d('2026-03-10', '13:30'),
            attendeeName: 'Full team',
        },
        {
            userId: 'usr_admin_123',
            title: '1:1 with Bob',
            type: 'MEETING', priority: 'ROUTINE',
            date: d('2026-03-10'),
            startTime: d('2026-03-10', '15:00'), endTime: d('2026-03-10', '15:30'),
            attendeeName: 'Bob',
            notes: 'Check on Prisma schema (#2) and session API (#3). Any blockers?',
        },
        // ── Wed Mar 11 ──
        {
            userId: 'usr_admin_123',
            title: 'Daily standup',
            type: 'MEETING', priority: 'ROUTINE',
            date: d('2026-03-11'),
            startTime: d('2026-03-11', '13:15'), endTime: d('2026-03-11', '13:30'),
            attendeeName: 'Full team',
        },
        {
            userId: 'usr_admin_123',
            title: 'Backlog refinement — sprint 2 issues (#9–#15)',
            type: 'MEETING', priority: 'IMPORTANT',
            date: d('2026-03-11'),
            startTime: d('2026-03-11', '16:00'), endTime: d('2026-03-11', '17:00'),
            attendeeName: 'Full team',
            notes: 'Estimate #9, #10, #13, #14, #15. Write acceptance criteria. Flag #13 recurrence as highest complexity.',
        },
        {
            userId: 'usr_admin_123',
            title: '1:1 with Amine',
            type: 'MEETING', priority: 'ROUTINE',
            date: d('2026-03-11'),
            startTime: d('2026-03-11', '17:30'), endTime: d('2026-03-11', '18:00'),
            attendeeName: 'Amine',
            notes: 'Progress on #4, #6, #7. Any design questions on the onboarding carousel flow?',
        },
        // ── Thu Mar 12 ──
        {
            userId: 'usr_admin_123',
            title: 'Daily standup',
            type: 'MEETING', priority: 'ROUTINE',
            date: d('2026-03-12'),
            startTime: d('2026-03-12', '13:15'), endTime: d('2026-03-12', '13:30'),
            attendeeName: 'Full team',
        },
        {
            userId: 'usr_admin_123',
            title: '1:1 with Sarah',
            type: 'MEETING', priority: 'ROUTINE',
            date: d('2026-03-12'),
            startTime: d('2026-03-12', '15:00'), endTime: d('2026-03-12', '15:30'),
            attendeeName: 'Sarah',
            notes: 'Progress on #8, #11. Is the carousel animation on track for the Friday demo?',
        },
        {
            userId: 'usr_admin_123',
            title: 'Prepare sprint 1 demo script',
            type: 'TASK', priority: 'IMPORTANT',
            date: d('2026-03-12'),
            notes: 'Draft demo order: scaffold → session auth → Zustand → CalendarStrip → TodoToday → onboarding → AddItemSheet → carousel',
        },
        // ── Fri Mar 13 ──
        {
            userId: 'usr_admin_123',
            title: 'Daily standup',
            type: 'MEETING', priority: 'ROUTINE',
            date: d('2026-03-13'),
            startTime: d('2026-03-13', '13:15'), endTime: d('2026-03-13', '13:30'),
            attendeeName: 'Full team',
        },
        {
            userId: 'usr_admin_123',
            title: 'Sprint 1 review & demo',
            type: 'EVENT', priority: 'IMPORTANT',
            date: d('2026-03-13'),
            startTime: d('2026-03-13', '19:00'), endTime: d('2026-03-13', '20:00'),
            attendeeName: 'Full team + stakeholders',
            notes: 'Facilitate demo. Collect stakeholder feedback on UX and feature completeness.',
        },
        {
            userId: 'usr_admin_123',
            title: 'Sprint 1 retrospective',
            type: 'MEETING', priority: 'IMPORTANT',
            date: d('2026-03-13'),
            startTime: d('2026-03-13', '20:00'), endTime: d('2026-03-13', '21:00'),
            attendeeName: 'Full team',
            notes: 'Format: went well / delta / actions. Focus: PR review turnaround time, test coverage baseline.',
        },
        // ── Mon Mar 16 ──
        {
            userId: 'usr_admin_123',
            title: 'Sprint 2 planning — facilitate',
            type: 'MEETING', priority: 'IMPORTANT',
            date: d('2026-03-16'),
            startTime: d('2026-03-16', '13:00'), endTime: d('2026-03-16', '14:30'),
            attendeeName: 'Full team',
            notes: 'Sprint 2 scope: #9, #10, #13, #14, #15. Push for 80% test coverage milestone.',
        },
        {
            userId: 'usr_admin_123',
            title: 'Update GitHub project board for sprint 2',
            type: 'TASK', priority: 'ROUTINE',
            date: d('2026-03-16'),
            notes: 'Move #9–#15 to In Progress column. Update milestones. Close any fully merged sprint 1 issues.',
        },
        // ── Tue Mar 17 ──
        {
            userId: 'usr_admin_123',
            title: 'Daily standup',
            type: 'MEETING', priority: 'ROUTINE',
            date: d('2026-03-17'),
            startTime: d('2026-03-17', '13:15'), endTime: d('2026-03-17', '13:30'),
            attendeeName: 'Full team',
        },
        {
            userId: 'usr_admin_123',
            title: '1:1 with Bob',
            type: 'MEETING', priority: 'ROUTINE',
            date: d('2026-03-17'),
            startTime: d('2026-03-17', '15:00'), endTime: d('2026-03-17', '15:30'),
            attendeeName: 'Bob',
            notes: 'Recurrence complexity (#13) — check if read-time expansion approach is on track. Risk flagging.',
        },
        // ── Wed Mar 18 ──
        {
            userId: 'usr_admin_123',
            title: 'Daily standup',
            type: 'MEETING', priority: 'ROUTINE',
            date: d('2026-03-18'),
            startTime: d('2026-03-18', '13:15'), endTime: d('2026-03-18', '13:30'),
            attendeeName: 'Full team',
        },
        {
            userId: 'usr_admin_123',
            title: 'Mid-sprint health check',
            type: 'MEETING', priority: 'IMPORTANT',
            date: d('2026-03-18'),
            startTime: d('2026-03-18', '16:00'), endTime: d('2026-03-18', '16:30'),
            attendeeName: 'Full team',
            notes: 'Burn-down review. Are #10, #13 on track? Any scope risk to cut for sprint 2?',
        },
        {
            userId: 'usr_admin_123',
            title: '1:1 with Amine',
            type: 'MEETING', priority: 'ROUTINE',
            date: d('2026-03-18'),
            startTime: d('2026-03-18', '17:00'), endTime: d('2026-03-18', '17:30'),
            attendeeName: 'Amine',
            notes: 'Theme toggle and quip generator progress. Is mobile QA feasible this sprint?',
        },
        // ── Thu Mar 19 ──
        {
            userId: 'usr_admin_123',
            title: 'Daily standup',
            type: 'MEETING', priority: 'ROUTINE',
            date: d('2026-03-19'),
            startTime: d('2026-03-19', '13:15'), endTime: d('2026-03-19', '13:30'),
            attendeeName: 'Full team',
        },
        {
            userId: 'usr_admin_123',
            title: '1:1 with Sarah',
            type: 'MEETING', priority: 'ROUTINE',
            date: d('2026-03-19'),
            startTime: d('2026-03-19', '15:00'), endTime: d('2026-03-19', '15:30'),
            attendeeName: 'Sarah',
            notes: 'Typography system and QA pass status. Confirm both PRs ship before Friday demo.',
        },
        {
            userId: 'usr_admin_123',
            title: 'Stakeholder update — sprint 2 progress',
            type: 'EVENT', priority: 'IMPORTANT',
            date: d('2026-03-19'),
            startTime: d('2026-03-19', '17:00'), endTime: d('2026-03-19', '17:30'),
            attendeeName: 'CTO, VP Product',
            notes: 'Share burn-down, highlight recurrence feature and mobile QA. Set expectations for sprint 2 demo.',
        },
        // ── Fri Mar 20 ──
        {
            userId: 'usr_admin_123',
            title: 'Daily standup',
            type: 'MEETING', priority: 'ROUTINE',
            date: d('2026-03-20'),
            startTime: d('2026-03-20', '13:15'), endTime: d('2026-03-20', '13:30'),
            attendeeName: 'Full team',
        },
        {
            userId: 'usr_admin_123',
            title: 'Sprint 2 review & demo',
            type: 'EVENT', priority: 'IMPORTANT',
            date: d('2026-03-20'),
            startTime: d('2026-03-20', '19:00'), endTime: d('2026-03-20', '20:00'),
            attendeeName: 'Full team + stakeholders',
            notes: 'Facilitate. Collect feedback on theme toggle, typography, and recurrence UX.',
        },
        {
            userId: 'usr_admin_123',
            title: 'Sprint 2 retrospective',
            type: 'MEETING', priority: 'IMPORTANT',
            date: d('2026-03-20'),
            startTime: d('2026-03-20', '20:00'), endTime: d('2026-03-20', '21:00'),
            attendeeName: 'Full team',
            notes: 'Topics: test coverage achievement, mobile QA process, recurrence complexity vs. estimate.',
        },
    ]});

    console.log('✓ Seeding complete.');
}

main()
    .catch((e) => { console.error(e); process.exit(1); })
    .finally(async () => { await prisma.$disconnect(); });
