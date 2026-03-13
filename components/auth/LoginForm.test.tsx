import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'

vi.mock('../../lib/store', () => ({
    useStore: vi.fn(),
}))

import { LoginForm } from './LoginForm'
import { useStore } from '../../lib/store'

const mockUseStore = useStore as ReturnType<typeof vi.fn>
const mockLogin = vi.fn()

function setupStore() {
    mockUseStore.mockImplementation((selector: (state: any) => any) => {
        const state = { login: mockLogin }
        return selector(state)
    })
}

describe('LoginForm', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        setupStore()
        global.fetch = vi.fn()
    })

    it('renders username and password fields and a submit button', () => {
        render(<LoginForm />)
        expect(screen.getByLabelText(/username/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
    })

    it('does not call fetch when submitted with empty fields (browser required validation)', async () => {
        render(<LoginForm />)
        const submitBtn = screen.getByRole('button', { name: /sign in/i })
        fireEvent.click(submitBtn)
        // HTML5 required validation prevents form submission
        expect(global.fetch).not.toHaveBeenCalled()
    })

    it('calls POST /api/auth/login with username and password on valid submit', async () => {
        const mockFetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({
                token: 'jwt-token',
                user: { id: 'u1', username: 'alice', displayName: 'Alice', role: 'USER' },
            }),
        })
        global.fetch = mockFetch

        render(<LoginForm />)
        await userEvent.type(screen.getByLabelText(/username/i), 'alice')
        await userEvent.type(screen.getByLabelText(/password/i), 'secret123')
        fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

        await waitFor(() => {
            expect(mockFetch).toHaveBeenCalledWith(
                '/api/auth/login',
                expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify({ username: 'alice', password: 'secret123' }),
                })
            )
        })
    })

    it('calls store login with user and token on successful response', async () => {
        const fakeUser = { id: 'u1', username: 'alice', displayName: 'Alice', role: 'USER' }
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ token: 'jwt-token', user: fakeUser }),
        })

        render(<LoginForm />)
        await userEvent.type(screen.getByLabelText(/username/i), 'alice')
        await userEvent.type(screen.getByLabelText(/password/i), 'secret123')
        fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

        await waitFor(() => {
            expect(mockLogin).toHaveBeenCalledWith(fakeUser, 'jwt-token')
        })
    })

    it('displays error message on failed response', async () => {
        global.fetch = vi.fn().mockResolvedValue({
            ok: false,
            json: async () => ({ error: 'Invalid username or password' }),
        })

        render(<LoginForm />)
        await userEvent.type(screen.getByLabelText(/username/i), 'alice')
        await userEvent.type(screen.getByLabelText(/password/i), 'wrongpass')
        fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

        await waitFor(() => {
            expect(screen.getByText(/Invalid username or password/i)).toBeInTheDocument()
        })
    })

    it('shows "Signing in..." on the button while loading', async () => {
        // Create a fetch that never resolves during this test
        let resolveFunc: (value: any) => void
        global.fetch = vi.fn().mockReturnValue(
            new Promise((resolve) => { resolveFunc = resolve })
        )

        render(<LoginForm />)
        await userEvent.type(screen.getByLabelText(/username/i), 'alice')
        await userEvent.type(screen.getByLabelText(/password/i), 'secret123')
        fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /signing in/i })).toBeInTheDocument()
        })
    })
})
