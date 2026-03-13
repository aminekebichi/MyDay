import { describe, it, expect } from 'vitest'
import { generateWeekOverview, generateClosingQuip } from './overviewQuip'

// Helper to build a minimal item
function makeItem(overrides: Record<string, unknown> = {}) {
    return {
        id: 'test-id',
        title: 'Test Item',
        type: 'TASK',
        priority: 'ROUTINE',
        date: '2026-03-12T10:00:00.000Z',
        completedAt: null,
        startTime: null,
        attendeeName: null,
        ...overrides,
    }
}

describe('generateWeekOverview', () => {
    it('returns empty message when no items', () => {
        expect(generateWeekOverview([])).toBe(
            'Nothing critical or important on the radar this week.'
        )
    })

    it('returns all-done message when all items are completed', () => {
        const items = [
            makeItem({ completedAt: '2026-03-12T11:00:00.000Z', priority: 'CRITICAL' }),
            makeItem({ completedAt: '2026-03-12T12:00:00.000Z', priority: 'IMPORTANT' }),
        ]
        expect(generateWeekOverview(items)).toBe(
            'Everything important this week is already wrapped up.'
        )
    })

    it('includes "critical" and item title for 1 critical item', () => {
        const items = [makeItem({ priority: 'CRITICAL', title: 'Fix the bug', type: 'TASK' })]
        const result = generateWeekOverview(items)
        expect(result.toLowerCase()).toContain('critical')
        expect(result).toContain('Fix the bug')
    })

    it('joins 2 critical + 1 important with "and"', () => {
        const items = [
            makeItem({ priority: 'CRITICAL', title: 'First critical', type: 'TASK' }),
            makeItem({ priority: 'CRITICAL', title: 'Second critical', type: 'TASK' }),
            makeItem({ priority: 'IMPORTANT', title: 'Important task', type: 'TASK' }),
        ]
        const result = generateWeekOverview(items)
        expect(result).toContain(' and ')
        expect(result.toLowerCase()).toContain('critical')
    })

    it('shows "+more critical items" overflow for 3+ critical items', () => {
        const items = [
            makeItem({ priority: 'CRITICAL', title: 'Critical 1', type: 'TASK' }),
            makeItem({ priority: 'CRITICAL', title: 'Critical 2', type: 'TASK' }),
            makeItem({ priority: 'CRITICAL', title: 'Critical 3', type: 'TASK' }),
        ]
        const result = generateWeekOverview(items)
        expect(result).toContain('more critical')
    })

    it('mentions "routine" for only routine items', () => {
        const items = [
            makeItem({ priority: 'ROUTINE', title: 'Routine task 1', type: 'TASK' }),
            makeItem({ priority: 'ROUTINE', title: 'Routine task 2', type: 'TASK' }),
        ]
        const result = generateWeekOverview(items)
        expect(result.toLowerCase()).toContain('routine')
    })

    it('mentions attendeeName for critical meeting', () => {
        const items = [
            makeItem({
                priority: 'CRITICAL',
                type: 'MEETING',
                title: 'Weekly sync',
                attendeeName: 'Alice',
            }),
        ]
        const result = generateWeekOverview(items)
        expect(result).toContain('meeting with Alice')
    })

    it('mentions "deadline for" for critical deadline', () => {
        const items = [
            makeItem({
                priority: 'CRITICAL',
                type: 'DEADLINE',
                title: 'Project submission',
            }),
        ]
        const result = generateWeekOverview(items)
        expect(result).toContain('deadline for')
        expect(result).toContain('Project submission')
    })
})

describe('generateClosingQuip', () => {
    it('returns "Blissfully quiet" for empty items', () => {
        expect(generateClosingQuip([])).toContain('Blissfully quiet')
    })

    it('returns "Blissfully quiet" when all items are completed', () => {
        const items = [
            makeItem({ completedAt: '2026-03-12T11:00:00.000Z', priority: 'CRITICAL' }),
        ]
        expect(generateClosingQuip(items)).toContain('Blissfully quiet')
    })

    it('returns "Three critical items" message for 3+ critical items', () => {
        const items = [
            makeItem({ priority: 'CRITICAL' }),
            makeItem({ priority: 'CRITICAL' }),
            makeItem({ priority: 'CRITICAL' }),
        ]
        expect(generateClosingQuip(items)).toContain('Three critical items')
    })

    it('returns "Two critical items" message for exactly 2 critical items', () => {
        const items = [
            makeItem({ priority: 'CRITICAL' }),
            makeItem({ priority: 'CRITICAL' }),
        ]
        expect(generateClosingQuip(items)).toContain('Two critical items')
    })

    it('returns "multiple meetings" message for 1 critical + 2+ meetings', () => {
        const items = [
            makeItem({ priority: 'CRITICAL' }),
            makeItem({ type: 'MEETING' }),
            makeItem({ type: 'MEETING' }),
        ]
        expect(generateClosingQuip(items)).toContain('multiple meetings')
    })

    it('returns "deadline in the same week" for 1 critical + 1+ deadline', () => {
        const items = [
            makeItem({ priority: 'CRITICAL' }),
            makeItem({ type: 'DEADLINE' }),
        ]
        expect(generateClosingQuip(items)).toContain('deadline in the same week')
    })

    it('returns "one critical item" for exactly 1 critical alone', () => {
        const items = [makeItem({ priority: 'CRITICAL' })]
        expect(generateClosingQuip(items)).toContain('one critical item')
    })

    it('mentions meeting count for 3+ meetings', () => {
        const items = [
            makeItem({ type: 'MEETING' }),
            makeItem({ type: 'MEETING' }),
            makeItem({ type: 'MEETING' }),
        ]
        const result = generateClosingQuip(items)
        expect(result).toContain('3 meetings')
    })

    it('returns "Back-to-back meetings" for exactly 2 meetings', () => {
        const items = [
            makeItem({ type: 'MEETING' }),
            makeItem({ type: 'MEETING' }),
        ]
        expect(generateClosingQuip(items)).toContain('Back-to-back meetings')
    })

    it('returns "Multiple deadlines" for 2 deadlines', () => {
        const items = [
            makeItem({ type: 'DEADLINE' }),
            makeItem({ type: 'DEADLINE' }),
        ]
        expect(generateClosingQuip(items)).toContain('Multiple deadlines')
    })

    it('returns "One deadline lurking" for 1 deadline', () => {
        const items = [makeItem({ type: 'DEADLINE' })]
        expect(generateClosingQuip(items)).toContain('One deadline lurking')
    })

    it('returns light fallback for routine items only', () => {
        const items = [makeItem({ priority: 'ROUTINE', type: 'TASK' })]
        const result = generateClosingQuip(items)
        // Should hit the light fallback array
        const lightPhrases = [
            "Not bad at all",
            "A manageable week",
            "Nothing too wild",
        ]
        expect(lightPhrases.some((p) => result.includes(p))).toBe(true)
    })
})
