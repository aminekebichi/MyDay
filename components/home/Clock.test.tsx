import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import React from 'react'
import { Clock } from './Clock'

const MOCK_TIME = new Date('2026-03-12T14:05:09.000Z')

describe('Clock', () => {
    beforeEach(() => {
        vi.useFakeTimers()
        vi.setSystemTime(MOCK_TIME)
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    it('renders HH:MM:SS time after mount', async () => {
        const { container } = render(<Clock />)
        // Trigger the useEffect
        await act(async () => {})
        const span = container.querySelector('span')
        expect(span).toBeInTheDocument()
        // The text should contain digit:digit:digit pattern
        expect(span?.textContent?.replace(/\s/g, '')).toMatch(/\d{2}:\d{2}:\d{2}/)
    })

    it('updates time every second', async () => {
        render(<Clock />)
        await act(async () => {})
        // Advance 1 second
        await act(async () => { vi.advanceTimersByTime(1000) })
        const span = screen.getByText(/\d{2}/, { selector: 'span' })
        expect(span).toBeInTheDocument()
    })

    it('clears interval on unmount', async () => {
        const clearIntervalSpy = vi.spyOn(global, 'clearInterval')
        const { unmount } = render(<Clock />)
        await act(async () => {})
        unmount()
        expect(clearIntervalSpy).toHaveBeenCalled()
    })
})
