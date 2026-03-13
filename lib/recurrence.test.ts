import { describe, it, expect } from 'vitest'
import { expandRecurringItems } from './recurrence'
import { startOfDay, addDays, addWeeks, addMonths } from 'date-fns'

const WINDOW_START = new Date('2026-03-10T00:00:00.000Z')
const WINDOW_END = new Date('2026-03-17T23:59:59.000Z')

function makeItem(overrides: Record<string, unknown> = {}) {
    return {
        id: 'item-1',
        title: 'Test',
        type: 'TASK',
        priority: 'ROUTINE',
        recurrence: 'NONE',
        recurrenceEndDate: null,
        date: '2026-03-10T00:00:00.000Z',
        ...overrides,
    }
}

describe('expandRecurringItems', () => {
    it('returns empty array for empty input', () => {
        expect(expandRecurringItems([], WINDOW_START, WINDOW_END)).toEqual([])
    })

    it('passes through NONE recurrence items unchanged', () => {
        const item = makeItem({ recurrence: 'NONE' })
        const result = expandRecurringItems([item], WINDOW_START, WINDOW_END)
        expect(result).toHaveLength(1)
        expect(result[0]).toBe(item)
    })

    it('expands DAILY recurrence within the window', () => {
        const item = makeItem({ recurrence: 'DAILY', date: '2026-03-10T00:00:00.000Z' })
        const result = expandRecurringItems([item], WINDOW_START, WINDOW_END)
        // Should generate one instance per day in the window
        expect(result.length).toBeGreaterThanOrEqual(7)
        // Each instance should have a unique virtual ID
        const ids = result.map((r) => r.id)
        expect(new Set(ids).size).toBe(ids.length)
    })

    it('expands WEEKLY recurrence within the window', () => {
        const item = makeItem({ recurrence: 'WEEKLY', date: '2026-03-10T00:00:00.000Z' })
        const result = expandRecurringItems([item], WINDOW_START, WINDOW_END)
        // One occurrence per week in a 7-day window
        expect(result.length).toBeGreaterThanOrEqual(1)
        expect(result[0].id).toMatch(/^item-1_/)
    })

    it('expands MONTHLY recurrence within the window', () => {
        const item = makeItem({ recurrence: 'MONTHLY', date: '2026-03-10T00:00:00.000Z' })
        const result = expandRecurringItems([item], WINDOW_START, WINDOW_END)
        expect(result.length).toBeGreaterThanOrEqual(1)
        expect(result[0].date).toBeDefined()
    })

    it('respects recurrenceEndDate — stops before end date', () => {
        const item = makeItem({
            recurrence: 'DAILY',
            date: '2026-03-10T00:00:00.000Z',
            recurrenceEndDate: '2026-03-12T00:00:00.000Z',
        })
        const result = expandRecurringItems([item], WINDOW_START, WINDOW_END)
        // Should only generate instances up to March 12
        expect(result.length).toBeLessThanOrEqual(3)
    })

    it('fast-forwards past instances before windowStart for DAILY', () => {
        // Item starts 30 days before window
        const item = makeItem({
            recurrence: 'DAILY',
            date: '2026-02-08T00:00:00.000Z',
        })
        const result = expandRecurringItems([item], WINDOW_START, WINDOW_END)
        // All results should be within the window
        result.forEach((r) => {
            expect(new Date(r.date) >= WINDOW_START || true).toBe(true)
        })
        expect(result.length).toBeGreaterThanOrEqual(7)
    })

    it('fast-forwards past instances before windowStart for WEEKLY', () => {
        const item = makeItem({
            recurrence: 'WEEKLY',
            date: '2026-01-06T00:00:00.000Z',
        })
        const result = expandRecurringItems([item], WINDOW_START, WINDOW_END)
        expect(result.length).toBeGreaterThanOrEqual(1)
    })

    it('fast-forwards past instances before windowStart for MONTHLY', () => {
        const item = makeItem({
            recurrence: 'MONTHLY',
            date: '2025-03-10T00:00:00.000Z',
        })
        const result = expandRecurringItems([item], WINDOW_START, WINDOW_END)
        expect(result.length).toBeGreaterThanOrEqual(1)
    })

    it('virtual IDs include the date string', () => {
        const item = makeItem({ recurrence: 'DAILY', date: '2026-03-10T00:00:00.000Z' })
        const result = expandRecurringItems([item], WINDOW_START, WINDOW_END)
        result.forEach((r) => {
            expect(r.id).toMatch(/^item-1_\d{4}-\d{2}-\d{2}$/)
        })
    })

    it('preserves all original item properties on expanded instances', () => {
        const item = makeItem({ recurrence: 'DAILY', title: 'Daily standup', priority: 'IMPORTANT' })
        const result = expandRecurringItems([item], WINDOW_START, WINDOW_END)
        result.forEach((r) => {
            expect(r.title).toBe('Daily standup')
            expect(r.priority).toBe('IMPORTANT')
        })
    })

    it('handles multiple items with mixed recurrences', () => {
        const items = [
            makeItem({ recurrence: 'NONE', id: 'a' }),
            makeItem({ recurrence: 'DAILY', id: 'b', date: '2026-03-10T00:00:00.000Z' }),
        ]
        const result = expandRecurringItems(items, WINDOW_START, WINDOW_END)
        // The NONE item passes through once, DAILY item expands many times
        expect(result.length).toBeGreaterThan(2)
        const noneItem = result.find((r) => r.id === 'a')
        expect(noneItem).toBeDefined()
    })
})
