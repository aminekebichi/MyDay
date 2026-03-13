import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import { startOfDay } from 'date-fns'

vi.mock('../../lib/store', () => ({
    useStore: vi.fn(),
}))

vi.mock('../shared/ItemRow', () => ({
    ItemRow: ({ item }: { item: any }) =>
        React.createElement('div', { 'data-testid': `item-row-${item.id}` }, item.title),
}))

import { TodoToday } from './TodoToday'
import { useStore } from '../../lib/store'

const mockUseStore = useStore as ReturnType<typeof vi.fn>

// Today's date from system-reminder context
const TODAY = new Date('2026-03-12T12:00:00.000Z')
const OTHER_DAY = new Date('2026-03-15T12:00:00.000Z')

function setupStore(items: any[], selectedDate: Date = TODAY) {
    mockUseStore.mockImplementation((selector: (state: any) => any) => {
        const state = {
            items,
            setEditingItem: vi.fn(),
            selectedDate,
        }
        return selector(state)
    })
}

function makeItem(overrides: Record<string, unknown> = {}) {
    return {
        id: 'item-1',
        title: 'Default Task',
        type: 'TASK',
        priority: 'ROUTINE',
        date: TODAY.toISOString(),
        completedAt: null,
        startTime: null,
        ...overrides,
    }
}

describe('TodoToday', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        // Mock Date.now so isToday works predictably
        vi.setSystemTime(TODAY)
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    it('shows "Nothing scheduled." when no items for selectedDate', () => {
        setupStore([])
        render(<TodoToday />)
        expect(screen.getByText('Nothing scheduled.')).toBeInTheDocument()
    })

    it('shows heading "Today" when selectedDate is today', () => {
        setupStore([], TODAY)
        render(<TodoToday />)
        expect(screen.getByText('Today')).toBeInTheDocument()
    })

    it('shows heading as formatted date when selectedDate is not today', () => {
        setupStore([], OTHER_DAY)
        render(<TodoToday />)
        // "Sunday, Mar 15" format
        expect(screen.getByText(/Mar 15/)).toBeInTheDocument()
    })

    it('renders one ItemRow per item on selectedDate', () => {
        const items = [
            makeItem({ id: 'item-1', date: TODAY.toISOString() }),
            makeItem({ id: 'item-2', date: TODAY.toISOString() }),
        ]
        setupStore(items, TODAY)
        render(<TodoToday />)
        expect(screen.getByTestId('item-row-item-1')).toBeInTheDocument()
        expect(screen.getByTestId('item-row-item-2')).toBeInTheDocument()
    })

    it('filters out items from other dates', () => {
        const items = [
            makeItem({ id: 'today-item', date: TODAY.toISOString() }),
            makeItem({ id: 'other-item', date: OTHER_DAY.toISOString() }),
        ]
        setupStore(items, TODAY)
        render(<TodoToday />)
        expect(screen.getByTestId('item-row-today-item')).toBeInTheDocument()
        expect(screen.queryByTestId('item-row-other-item')).not.toBeInTheDocument()
    })

    it('shows N/M done counter when items are present', () => {
        const items = [
            makeItem({ id: 'item-1', completedAt: '2026-03-12T08:00:00.000Z' }),
            makeItem({ id: 'item-2', completedAt: null }),
        ]
        setupStore(items, TODAY)
        render(<TodoToday />)
        expect(screen.getByText('1/2 done')).toBeInTheDocument()
    })

    it('items sorted by priority then startTime', () => {
        const items = [
            makeItem({ id: 'routine-late', priority: 'ROUTINE', startTime: '2026-03-12T14:00:00.000Z' }),
            makeItem({ id: 'critical-early', priority: 'CRITICAL', startTime: '2026-03-12T09:00:00.000Z' }),
            makeItem({ id: 'important-mid', priority: 'IMPORTANT', startTime: '2026-03-12T11:00:00.000Z' }),
        ]
        setupStore(items, TODAY)
        render(<TodoToday />)
        const allRows = screen.getAllByTestId(/item-row-/)
        // CRITICAL should come first, then IMPORTANT, then ROUTINE
        expect(allRows[0].getAttribute('data-testid')).toBe('item-row-critical-early')
        expect(allRows[1].getAttribute('data-testid')).toBe('item-row-important-mid')
        expect(allRows[2].getAttribute('data-testid')).toBe('item-row-routine-late')
    })
})
