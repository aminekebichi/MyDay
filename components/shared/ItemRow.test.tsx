import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import React from 'react'

vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement> & { children?: React.ReactNode }) =>
            React.createElement('div', props, children),
    },
}))

vi.mock('../../lib/store', () => ({
    useStore: vi.fn(),
}))

import { ItemRow } from './ItemRow'
import { useStore } from '../../lib/store'

const mockUseStore = useStore as ReturnType<typeof vi.fn>

function buildItem(overrides: Record<string, unknown> = {}) {
    return {
        id: 'item-1',
        title: 'Test Task',
        type: 'TASK',
        priority: 'ROUTINE',
        date: '2026-03-12T00:00:00.000Z',
        completedAt: null,
        startTime: null,
        endTime: null,
        location: null,
        attendeeName: null,
        notes: null,
        ...overrides,
    }
}

const mockUpdateItem = vi.fn()
const mockToken = 'test-token-abc'

function setupStore(overrides: Record<string, unknown> = {}) {
    mockUseStore.mockImplementation((selector: (state: any) => any) => {
        const state = {
            token: mockToken,
            updateItem: mockUpdateItem,
            ...overrides,
        }
        return selector(state)
    })
}

describe('ItemRow', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        setupStore()
        global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) })
    })

    it('renders the item title', () => {
        render(<ItemRow item={buildItem({ title: 'Buy groceries' })} />)
        expect(screen.getByText('Buy groceries')).toBeInTheDocument()
    })

    it('renders 3 bars for CRITICAL priority', () => {
        const item = buildItem({ priority: 'CRITICAL' })
        const { container } = render(<ItemRow item={item} />)
        const bars = container.querySelectorAll('[style*="height: 3px"]')
        // All 3 bars should have non-border colors (all filled)
        let filledCount = 0
        bars.forEach((bar) => {
            const style = (bar as HTMLElement).style.backgroundColor
            if (style !== 'var(--border)') filledCount++
        })
        expect(filledCount).toBe(3)
    })

    it('renders 2 filled bars for IMPORTANT priority', () => {
        const item = buildItem({ priority: 'IMPORTANT' })
        const { container } = render(<ItemRow item={item} />)
        const bars = container.querySelectorAll('[style*="height: 3px"]')
        let borderCount = 0
        bars.forEach((bar) => {
            const style = (bar as HTMLElement).style.backgroundColor
            if (style === 'var(--border)') borderCount++
        })
        expect(borderCount).toBe(1)
    })

    it('renders 1 filled bar for ROUTINE priority', () => {
        const item = buildItem({ priority: 'ROUTINE' })
        const { container } = render(<ItemRow item={item} />)
        const bars = container.querySelectorAll('[style*="height: 3px"]')
        let borderCount = 0
        bars.forEach((bar) => {
            const style = (bar as HTMLElement).style.backgroundColor
            if (style === 'var(--border)') borderCount++
        })
        expect(borderCount).toBe(2)
    })

    it('applies line-through class on completed item title', () => {
        const item = buildItem({ completedAt: '2026-03-12T10:00:00.000Z' })
        render(<ItemRow item={item} />)
        const titleEl = screen.getByText('Test Task')
        expect(titleEl.className).toContain('line-through')
    })

    it('does not apply line-through on incomplete item', () => {
        render(<ItemRow item={buildItem()} />)
        const titleEl = screen.getByText('Test Task')
        expect(titleEl.className).not.toContain('line-through')
    })

    it('checkbox click calls updateItem optimistically and fires PATCH', async () => {
        const item = buildItem()
        render(<ItemRow item={item} />)
        const checkbox = screen.getByRole('checkbox')
        fireEvent.click(checkbox)
        expect(mockUpdateItem).toHaveBeenCalledWith('item-1', expect.objectContaining({ completedAt: expect.any(String) }))
        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
                '/api/items/item-1',
                expect.objectContaining({ method: 'PATCH' })
            )
        })
    })

    it('rolls back optimistic update when PATCH fails', async () => {
        global.fetch = vi.fn().mockResolvedValue({ ok: false })
        const item = buildItem()
        render(<ItemRow item={item} />)
        const checkbox = screen.getByRole('checkbox')
        fireEvent.click(checkbox)
        await waitFor(() => {
            // Called twice: once for optimistic update, once for rollback
            expect(mockUpdateItem).toHaveBeenCalledTimes(2)
            expect(mockUpdateItem).toHaveBeenLastCalledWith('item-1', { completedAt: null })
        })
    })

    it('edit button calls onEdit with the item when clicked', () => {
        const onEdit = vi.fn()
        const item = buildItem()
        render(<ItemRow item={item} onEdit={onEdit} />)
        const editBtn = screen.getByRole('button', { name: /edit test task/i })
        fireEvent.click(editBtn)
        expect(onEdit).toHaveBeenCalledWith(item)
    })

    it('edit button calls stopPropagation', () => {
        const onEdit = vi.fn()
        const parentClickHandler = vi.fn()
        const item = buildItem()
        const { container } = render(
            <div onClick={parentClickHandler}>
                <ItemRow item={item} onEdit={onEdit} />
            </div>
        )
        const editBtn = screen.getByRole('button', { name: /edit test task/i })
        fireEvent.click(editBtn)
        expect(onEdit).toHaveBeenCalledTimes(1)
        expect(parentClickHandler).not.toHaveBeenCalled()
    })

    it('does not render edit button when onEdit is not provided', () => {
        render(<ItemRow item={buildItem()} />)
        expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument()
    })

    it('shows time metadata when startTime is present', () => {
        const item = buildItem({ startTime: '2026-03-12T09:00:00.000Z' })
        const { container } = render(<ItemRow item={item} />)
        // RTL's implicit role for <time> is not universally supported — query by element type
        expect(container.querySelector('time')).toBeInTheDocument()
    })

    it('shows location when location is present', () => {
        const item = buildItem({ location: 'Conference Room B' })
        render(<ItemRow item={item} />)
        expect(screen.getByText(/Conference Room B/)).toBeInTheDocument()
    })

    it('shows attendeeName when present', () => {
        const item = buildItem({ attendeeName: 'Bob Smith' })
        render(<ItemRow item={item} />)
        expect(screen.getByText(/Bob Smith/)).toBeInTheDocument()
    })
})
