import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'

vi.mock('../../lib/store', () => ({
    useStore: vi.fn(),
}))

import { AddButton } from './AddButton'
import { useStore } from '../../lib/store'

const mockUseStore = useStore as ReturnType<typeof vi.fn>

describe('AddButton', () => {
    const mockSetIsOpen = vi.fn()

    beforeEach(() => {
        vi.clearAllMocks()
        mockUseStore.mockImplementation((selector: (state: any) => any) =>
            selector({ setIsAddSheetOpen: mockSetIsOpen })
        )
    })

    it('renders with "Add to MyDay" label', () => {
        render(<AddButton />)
        expect(screen.getByRole('button', { name: /add item to myday/i })).toBeInTheDocument()
    })

    it('calls setIsAddSheetOpen(true) when clicked', () => {
        render(<AddButton />)
        fireEvent.click(screen.getByRole('button', { name: /add item to myday/i }))
        expect(mockSetIsOpen).toHaveBeenCalledWith(true)
    })
})
