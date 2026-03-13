import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import { PriorityBadge } from './PriorityBadge'
import { PRIORITY_COLORS } from '../../lib/constants'

function hexToRgb(hex: string): string {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return `rgb(${r}, ${g}, ${b})`
}

describe('PriorityBadge', () => {
    it('renders ROUTINE label', () => {
        render(<PriorityBadge priority="ROUTINE" />)
        expect(screen.getByText('Routine')).toBeInTheDocument()
    })

    it('renders IMPORTANT label', () => {
        render(<PriorityBadge priority="IMPORTANT" />)
        expect(screen.getByText('Important')).toBeInTheDocument()
    })

    it('renders CRITICAL label', () => {
        render(<PriorityBadge priority="CRITICAL" />)
        expect(screen.getByText('Critical')).toBeInTheDocument()
    })

    it('applies the correct color for CRITICAL', () => {
        const { container } = render(<PriorityBadge priority="CRITICAL" />)
        const span = container.querySelector('span')
        // jsdom normalizes hex to rgb() in computed styles; check the style attribute
        const style = span?.getAttribute('style') ?? ''
        const criticalRgb = hexToRgb(PRIORITY_COLORS.CRITICAL.dark)
        expect(style.includes(PRIORITY_COLORS.CRITICAL.dark) || style.includes(criticalRgb)).toBe(true)
    })

    it('applies the correct color for IMPORTANT', () => {
        const { container } = render(<PriorityBadge priority="IMPORTANT" />)
        const span = container.querySelector('span')
        const style = span?.getAttribute('style') ?? ''
        const importantRgb = hexToRgb(PRIORITY_COLORS.IMPORTANT.dark)
        expect(style.includes(PRIORITY_COLORS.IMPORTANT.dark) || style.includes(importantRgb)).toBe(true)
    })
})
