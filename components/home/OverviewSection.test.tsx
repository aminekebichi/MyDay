import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'

vi.mock('../../lib/store', () => ({
    useStore: vi.fn(),
}))

import { OverviewSection } from './OverviewSection'
import { useStore } from '../../lib/store'
import { PRIORITY_COLORS } from '../../lib/constants'

const mockUseStore = useStore as ReturnType<typeof vi.fn>

// Pin "today" so the useMemo interval filter works deterministically
const TODAY = new Date('2026-03-12T12:00:00.000Z')

function setupStore(items: any[]) {
    mockUseStore.mockImplementation((selector: (state: any) => any) => {
        const state = { items }
        return selector(state)
    })
}

function makeItem(overrides: Record<string, unknown> = {}) {
    return {
        id: 'item-1',
        title: 'Test task',
        type: 'TASK',
        priority: 'ROUTINE',
        // Use noon UTC so the date stays March 12 in all timezones
        date: '2026-03-12T12:00:00.000Z',
        completedAt: null,
        startTime: null,
        attendeeName: null,
        ...overrides,
    }
}

/** Convert a 6-digit hex color to the rgb() string jsdom uses in inline styles */
function hexToRgb(hex: string): string {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return `rgb(${r}, ${g}, ${b})`
}

/**
 * Match a <p> whose full text content (whitespace-collapsed) contains the given string.
 * Needed because colorize() splits text across multiple span children.
 */
function pTextMatcher(expected: string | RegExp) {
    return (_: string, element: Element | null) => {
        if (element?.tagName !== 'P') return false
        const normalized = (element.textContent ?? '').replace(/\s+/g, ' ').trim()
        return typeof expected === 'string'
            ? normalized.includes(expected)
            : expected.test(normalized)
    }
}

describe('OverviewSection', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        vi.setSystemTime(TODAY)
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    it('renders overview text from generateWeekOverview', () => {
        setupStore([])
        render(<OverviewSection />)
        expect(
            screen.getByText(pTextMatcher(/Nothing critical or important on the radar this week\./i))
        ).toBeInTheDocument()
    })

    it('renders quip from generateClosingQuip', () => {
        setupStore([])
        render(<OverviewSection />)
        expect(screen.getByText(/Blissfully quiet/i)).toBeInTheDocument()
    })

    it('colorizes "critical" word in the CRITICAL priority accent color', () => {
        const items = [makeItem({ priority: 'CRITICAL', title: 'Critical bug fix', type: 'TASK' })]
        setupStore(items)
        const { container } = render(<OverviewSection />)
        // jsdom normalizes hex colors to rgb() in style attributes
        const criticalRgb = hexToRgb(PRIORITY_COLORS.CRITICAL.dark)
        const spans = container.querySelectorAll('span')
        const criticalSpan = Array.from(spans).find(
            (s) => (s as HTMLElement).getAttribute('style')?.includes(criticalRgb)
        )
        expect(criticalSpan).toBeDefined()
        expect(criticalSpan?.textContent?.toLowerCase()).toContain('critical')
    })

    it('colorizes "important" word in the IMPORTANT priority amber color', () => {
        const items = [
            makeItem({ priority: 'IMPORTANT', title: 'Important meeting', type: 'MEETING' }),
        ]
        setupStore(items)
        const { container } = render(<OverviewSection />)
        const importantRgb = hexToRgb(PRIORITY_COLORS.IMPORTANT.dark)
        const spans = container.querySelectorAll('span')
        const importantSpan = Array.from(spans).find(
            (s) => (s as HTMLElement).getAttribute('style')?.includes(importantRgb)
        )
        expect(importantSpan).toBeDefined()
        expect(importantSpan?.textContent?.toLowerCase()).toContain('important')
    })

    it('updates overview when items store changes', () => {
        setupStore([])
        const { rerender } = render(<OverviewSection />)
        expect(
            screen.getByText(pTextMatcher(/Nothing critical or important on the radar this week\./i))
        ).toBeInTheDocument()

        // Change the store to have a critical item
        setupStore([makeItem({ priority: 'CRITICAL', title: 'Deploy hotfix', type: 'TASK' })])
        rerender(<OverviewSection />)

        expect(screen.getByText(/Deploy hotfix/i)).toBeInTheDocument()
    })

    it('excludes completed items from overview computation', () => {
        const items = [
            makeItem({
                priority: 'CRITICAL',
                title: 'Already done',
                completedAt: '2026-03-12T08:00:00.000Z',
            }),
        ]
        setupStore(items)
        render(<OverviewSection />)
        expect(
            screen.getByText(pTextMatcher(/Everything important this week is already wrapped up\./i))
        ).toBeInTheDocument()
    })
})
