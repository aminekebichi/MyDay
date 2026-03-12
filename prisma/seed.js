// Seed script — wipes the DB and populates with Agile sprint mock data
// modelled on the MyDay GitHub issues (#1–#15).
// Run: npx prisma db seed

const { PrismaClient } = require('@prisma/client');
const { addDays, startOfDay } = require('date-fns');

const prisma = new PrismaClient();

// Build a Date for `baseDate` with the given hours/minutes
function at(baseDate, hh, mm = 0) {
    const d = new Date(baseDate);
    d.setHours(hh, mm, 0, 0);
    return d;
}

async function main() {
    // ── Wipe ──────────────────────────────────────────────────────────────────
    console.log('Cleaning database...');
    await prisma.item.deleteMany();
    await prisma.user.deleteMany();

    // ── User ──────────────────────────────────────────────────────────────────
    console.log('Creating user...');
    const user = await prisma.user.create({
        data: {
            id: 'usr_test_123',
            displayName: 'Amine',
            sessionToken: 'usr_test_123',
            theme: 'dark',
            lastOpenedAt: new Date(),
        },
    });

    // Date anchors — all relative to today so the seed stays fresh
    // Today is assumed to be Thursday (Sprint 2 wrap-up day)
    const today   = startOfDay(new Date()); // Thu — Sprint 2 demo day
    const fri     = addDays(today, 1);      // Fri — Retro + Sprint 2 close
    const mon     = addDays(today, 4);      // Mon — Sprint 3 planning
    const tue     = addDays(today, 5);      // Tue — CRUD API + 1:1
    const wed     = addDays(today, 6);      // Wed — Mid-sprint check-in
    const thu     = addDays(today, 7);      // Thu — Recurrence + typography
    const fri2    = addDays(today, 8);      // Fri — QA pass + final PR deadline
    const mon2    = addDays(today, 11);     // Mon — Sprint 4 planning
    const tue2    = addDays(today, 12);     // Tue — Sprint 4 dev
    const wed2    = addDays(today, 13);     // Wed — Sprint 4 mid-sprint
    const thu2    = addDays(today, 14);     // Thu — Sprint 4 dev
    const fri3    = addDays(today, 15);     // Fri — Sprint 4 close

    console.log('Seeding sprint items...');
    await prisma.item.createMany({
        data: [

            // ── THURSDAY (today) — Sprint 2 demo & wrap-up ───────────────────

            {
                userId: user.id,
                title: 'Sprint 2 Demo & Review',
                type: 'MEETING',
                priority: 'CRITICAL',
                date: today,
                startTime: at(today, 14),
                endTime: at(today, 15, 30),
                attendeeName: 'Full Team',
                notes: 'Demo: calendar strip (#6), Todo list (#7), Add Item sheet (#8). Acceptance criteria sign-off.',
            },
            {
                userId: user.id,
                title: 'Merge calendar strip PR — closes #6',
                type: 'TASK',
                priority: 'CRITICAL',
                date: today,
                notes: 'Final review pass, resolve merge conflicts, push to main before the 2pm demo.',
            },
            {
                userId: user.id,
                title: 'Merge Todo list PR — closes #7',
                type: 'TASK',
                priority: 'IMPORTANT',
                date: today,
                notes: 'Verify optimistic toggle + rollback in staging before demo.',
            },
            {
                userId: user.id,
                title: 'Merge Add Item sheet PR — closes #8',
                type: 'TASK',
                priority: 'IMPORTANT',
                date: today,
                notes: 'Confirm per-type field visibility logic works end-to-end.',
            },
            {
                userId: user.id,
                title: 'Update GitHub issue tracker for Sprint 2 close',
                type: 'TASK',
                priority: 'ROUTINE',
                date: today,
                notes: 'Close #5, #6, #7, #8. Add "done" label. Update project board.',
            },

            // ── FRIDAY — Sprint 2 retrospective ──────────────────────────────

            {
                userId: user.id,
                title: 'Sprint 2 Retrospective',
                type: 'MEETING',
                priority: 'IMPORTANT',
                date: fri,
                startTime: at(fri, 10),
                endTime: at(fri, 11),
                attendeeName: 'Full Team',
                notes: 'What went well, what didn\'t, action items for Sprint 3.',
            },
            {
                userId: user.id,
                title: 'Write Sprint 2 summary & velocity doc',
                type: 'ASSIGNMENT',
                priority: 'ROUTINE',
                date: fri,
                notes: 'Document burn-down, completed issues, carry-overs, and sprint screenshots.',
            },

            // ── MONDAY — Sprint 3 kick-off ────────────────────────────────────

            {
                userId: user.id,
                title: 'Sprint 3 Planning',
                type: 'MEETING',
                priority: 'CRITICAL',
                date: mon,
                startTime: at(mon, 9),
                endTime: at(mon, 11),
                attendeeName: 'Full Team',
                notes: 'Scope: #11 carousel, #12 CRUD API, #13 recurrence, #14 typography, #15 mobile QA. Story point estimation.',
            },
            {
                userId: user.id,
                title: 'Daily standup',
                type: 'MEETING',
                priority: 'ROUTINE',
                date: mon,
                startTime: at(mon, 9, 30),
                endTime: at(mon, 9, 45),
                attendeeName: 'Full Team',
            },
            {
                userId: user.id,
                title: 'Scaffold CRUD API routes — #12',
                type: 'TASK',
                priority: 'IMPORTANT',
                date: mon,
                notes: 'Scaffold GET/POST /api/items and PATCH/DELETE /api/items/[id]. Wire validateSession() from lib/session.ts.',
            },

            // ── TUESDAY ──────────────────────────────────────────────────────

            {
                userId: user.id,
                title: 'Daily standup',
                type: 'MEETING',
                priority: 'ROUTINE',
                date: tue,
                startTime: at(tue, 9, 30),
                endTime: at(tue, 9, 45),
                attendeeName: 'Full Team',
            },
            {
                userId: user.id,
                title: 'Implement CRUD API routes — closes #12',
                type: 'ASSIGNMENT',
                priority: 'CRITICAL',
                date: tue,
                notes: 'Full GET, POST, PATCH, DELETE with Zod validation and session auth. Unit + integration tests required.',
            },
            {
                userId: user.id,
                title: '1:1 with Tech Lead',
                type: 'MEETING',
                priority: 'IMPORTANT',
                date: tue,
                startTime: at(tue, 15),
                endTime: at(tue, 15, 30),
                attendeeName: 'Tech Lead',
                notes: 'Discuss architecture for recurrence expansion (#13) and carousel session gate logic (#11).',
            },

            // ── WEDNESDAY — mid-sprint check-in ──────────────────────────────

            {
                userId: user.id,
                title: 'Daily standup',
                type: 'MEETING',
                priority: 'ROUTINE',
                date: wed,
                startTime: at(wed, 9, 30),
                endTime: at(wed, 9, 45),
                attendeeName: 'Full Team',
            },
            {
                userId: user.id,
                title: 'Sprint 3 mid-sprint check-in — #11 & #12 must be merged',
                type: 'DEADLINE',
                priority: 'CRITICAL',
                date: wed,
                notes: 'Carousel (#11) and CRUD API (#12) PRs merged to main by EOD Wednesday.',
            },
            {
                userId: user.id,
                title: 'Build daily intro carousel — closes #11',
                type: 'ASSIGNMENT',
                priority: 'CRITICAL',
                date: wed,
                notes: '3-slide flow: Welcome, Feature Tour, Profile Setup. Gate: no token → onboarding; stale lastOpenedAt → carousel.',
            },
            {
                userId: user.id,
                title: 'Write integration tests for CRUD API routes',
                type: 'TASK',
                priority: 'IMPORTANT',
                date: wed,
                notes: 'Use real SQLite test DB — no mocks. Cover auth failures, Zod validation errors, and 404s.',
            },

            // ── THURSDAY (next week) ──────────────────────────────────────────

            {
                userId: user.id,
                title: 'Daily standup',
                type: 'MEETING',
                priority: 'ROUTINE',
                date: thu,
                startTime: at(thu, 9, 30),
                endTime: at(thu, 9, 45),
                attendeeName: 'Full Team',
            },
            {
                userId: user.id,
                title: 'Implement recurrence expansion at read time — closes #13',
                type: 'ASSIGNMENT',
                priority: 'IMPORTANT',
                date: thu,
                notes: 'Expand in GET /api/items/week only. Support DAILY, WEEKLY, MONTHLY. No duplicate rows written to DB.',
            },
            {
                userId: user.id,
                title: 'Apply typography system — closes #14',
                type: 'TASK',
                priority: 'IMPORTANT',
                date: thu,
                notes: 'Instrument Serif → headings/logo, Geist Mono → body/labels, Caveat → personality copy only.',
            },

            // ── FRIDAY (next week) — Sprint 3 close ──────────────────────────

            {
                userId: user.id,
                title: 'Daily standup',
                type: 'MEETING',
                priority: 'ROUTINE',
                date: fri2,
                startTime: at(fri2, 9, 30),
                endTime: at(fri2, 9, 45),
                attendeeName: 'Full Team',
            },
            {
                userId: user.id,
                title: 'Mobile responsive QA pass — closes #15',
                type: 'ASSIGNMENT',
                priority: 'IMPORTANT',
                date: fri2,
                notes: 'Test at 375px (iPhone SE) and 768px (iPad). Cover calendar strip, add dialog, todo list, CTA button.',
            },
            {
                userId: user.id,
                title: 'Sprint 3 final PR deadline — all issues merged',
                type: 'DEADLINE',
                priority: 'CRITICAL',
                date: fri2,
                notes: '#11, #12, #13, #14, #15 — all PRs merged to main by EOD Friday.',
            },
            {
                userId: user.id,
                title: 'Sprint 3 Demo prep',
                type: 'TASK',
                priority: 'IMPORTANT',
                date: fri2,
                notes: 'Prepare demo script and screenshots for next sprint review.',
            },
            {
                userId: user.id,
                title: 'Team Lunch',
                type: 'EVENT',
                priority: 'ROUTINE',
                date: fri2,
                startTime: at(fri2, 12),
                endTime: at(fri2, 13, 30),
                location: 'The Canteen',
                attendeeName: 'Full Team',
            },

            // ── MONDAY (Sprint 4 kick-off, Mar 23) ───────────────────────────

            {
                userId: user.id,
                title: 'Sprint 4 Planning',
                type: 'MEETING',
                priority: 'CRITICAL',
                date: mon2,
                startTime: at(mon2, 9),
                endTime: at(mon2, 11),
                attendeeName: 'Full Team',
                notes: 'Scope: light/dark theme toggle (#10), onboarding tour (#4), session API hardening (#3). Point estimation.',
            },
            {
                userId: user.id,
                title: 'Daily standup',
                type: 'MEETING',
                priority: 'ROUTINE',
                date: mon2,
                startTime: at(mon2, 9, 30),
                endTime: at(mon2, 9, 45),
                attendeeName: 'Full Team',
            },
            {
                userId: user.id,
                title: 'Implement light/dark theme toggle — closes #10',
                type: 'ASSIGNMENT',
                priority: 'IMPORTANT',
                date: mon2,
                notes: 'Persist preference to localStorage. Toggle on <html data-theme="...">. Confirm all CSS tokens update correctly.',
            },
            {
                userId: user.id,
                title: 'Design review: onboarding tour mocks',
                type: 'MEETING',
                priority: 'IMPORTANT',
                date: mon2,
                startTime: at(mon2, 14),
                endTime: at(mon2, 14, 45),
                attendeeName: 'Design Lead',
                notes: 'Review 3-step onboarding flow wireframes before implementation begins (#4).',
            },

            // ── TUESDAY (Sprint 4) ────────────────────────────────────────────

            {
                userId: user.id,
                title: 'Daily standup',
                type: 'MEETING',
                priority: 'ROUTINE',
                date: tue2,
                startTime: at(tue2, 9, 30),
                endTime: at(tue2, 9, 45),
                attendeeName: 'Full Team',
            },
            {
                userId: user.id,
                title: 'Build first-time onboarding tour — closes #4',
                type: 'ASSIGNMENT',
                priority: 'CRITICAL',
                date: tue2,
                notes: '3-step: Welcome → Feature Tour → Profile Setup. Only shown when no session token exists.',
            },
            {
                userId: user.id,
                title: 'Harden session API — closes #3',
                type: 'TASK',
                priority: 'IMPORTANT',
                date: tue2,
                notes: 'Validate UUID format, add rate limiting, ensure token rotation on re-auth.',
            },

            // ── WEDNESDAY — mid-sprint check-in ──────────────────────────────

            {
                userId: user.id,
                title: 'Daily standup',
                type: 'MEETING',
                priority: 'ROUTINE',
                date: wed2,
                startTime: at(wed2, 9, 30),
                endTime: at(wed2, 9, 45),
                attendeeName: 'Full Team',
            },
            {
                userId: user.id,
                title: 'Sprint 4 mid-sprint check-in — theme + onboarding merged',
                type: 'DEADLINE',
                priority: 'CRITICAL',
                date: wed2,
                notes: 'Theme toggle (#10) and onboarding tour (#4) PRs must be merged by EOD Wednesday.',
            },
            {
                userId: user.id,
                title: 'Write onboarding tour tests',
                type: 'TASK',
                priority: 'IMPORTANT',
                date: wed2,
                notes: 'Test session gate logic, carousel navigation, and profile setup submission.',
            },
            {
                userId: user.id,
                title: 'Accessibility audit — WCAG 2.5.5 tap targets',
                type: 'ASSIGNMENT',
                priority: 'IMPORTANT',
                date: wed2,
                notes: 'Verify all interactive elements meet 44×44px minimum. Fix any violations.',
            },

            // ── THURSDAY ─────────────────────────────────────────────────────

            {
                userId: user.id,
                title: 'Daily standup',
                type: 'MEETING',
                priority: 'ROUTINE',
                date: thu2,
                startTime: at(thu2, 9, 30),
                endTime: at(thu2, 9, 45),
                attendeeName: 'Full Team',
            },
            {
                userId: user.id,
                title: '1:1 with Tech Lead',
                type: 'MEETING',
                priority: 'IMPORTANT',
                date: thu2,
                startTime: at(thu2, 15),
                endTime: at(thu2, 15, 30),
                attendeeName: 'Tech Lead',
                notes: 'Review Sprint 4 progress, discuss SWR caching strategy and Zustand session slice.',
            },
            {
                userId: user.id,
                title: 'SWR cache invalidation review',
                type: 'TASK',
                priority: 'IMPORTANT',
                date: thu2,
                notes: 'Ensure item mutations correctly invalidate useWeekItems and useItems SWR keys.',
            },
            {
                userId: user.id,
                title: 'End-to-end smoke test on staging',
                type: 'TASK',
                priority: 'ROUTINE',
                date: thu2,
                notes: 'Full flow: onboarding → carousel → home → add item → complete item → edit item.',
            },

            // ── FRIDAY (Sprint 4 close) ───────────────────────────────────────

            {
                userId: user.id,
                title: 'Daily standup',
                type: 'MEETING',
                priority: 'ROUTINE',
                date: fri3,
                startTime: at(fri3, 9, 30),
                endTime: at(fri3, 9, 45),
                attendeeName: 'Full Team',
            },
            {
                userId: user.id,
                title: 'Sprint 4 final PR deadline — all issues merged',
                type: 'DEADLINE',
                priority: 'CRITICAL',
                date: fri3,
                notes: '#3, #4, #10 PRs merged to main by EOD Friday.',
            },
            {
                userId: user.id,
                title: 'Sprint 4 Demo & Review',
                type: 'MEETING',
                priority: 'CRITICAL',
                date: fri3,
                startTime: at(fri3, 14),
                endTime: at(fri3, 15, 30),
                attendeeName: 'Full Team',
                notes: 'Demo: theme toggle (#10), onboarding tour (#4), session hardening (#3).',
            },
            {
                userId: user.id,
                title: 'Sprint 4 Retrospective',
                type: 'MEETING',
                priority: 'IMPORTANT',
                date: fri3,
                startTime: at(fri3, 16),
                endTime: at(fri3, 17),
                attendeeName: 'Full Team',
                notes: 'Retro + plan for final polish sprint.',
            },
        ],
    });

    const count = await prisma.item.count();
    console.log(`✓ Seeded ${count} items for "${user.displayName}" (token: ${user.sessionToken})`);
}

main()
    .catch((e) => { console.error(e); process.exit(1); })
    .finally(() => prisma.$disconnect());
