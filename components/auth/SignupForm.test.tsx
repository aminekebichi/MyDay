import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import React from 'react'

vi.mock('../../lib/store', () => ({
    useStore: vi.fn(),
}))

import { SignupForm } from './SignupForm'
import { useStore } from '../../lib/store'

const mockUseStore = useStore as ReturnType<typeof vi.fn>
const mockLogin = vi.fn()

function setupStore() {
    mockUseStore.mockImplementation((selector: (state: any) => any) =>
        selector({ login: mockLogin })
    )
}

describe('SignupForm', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        setupStore()
        global.fetch = vi.fn()
    })

    it('renders display name, username and password fields', () => {
        render(<SignupForm />)
        expect(screen.getByLabelText(/display name/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/username/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    })

    it('renders a Sign Up button', () => {
        render(<SignupForm />)
        expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument()
    })

    it('calls POST /api/auth/signup with form values on submit', async () => {
        ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
            ok: true,
            json: async () => ({ user: { id: 'u1', username: 'bob', role: 'USER' }, token: 'tok' }),
        })
        render(<SignupForm />)
        fireEvent.change(screen.getByLabelText(/display name/i), { target: { value: 'Bob' } })
        fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'bob' } })
        fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'secret' } })
        fireEvent.submit(screen.getByRole('button', { name: /sign up/i }).closest('form')!)
        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
                '/api/auth/signup',
                expect.objectContaining({ method: 'POST' })
            )
        })
    })

    it('calls store login on successful signup', async () => {
        const fakeUser = { id: 'u1', username: 'bob', role: 'USER' }
        ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
            ok: true,
            json: async () => ({ user: fakeUser, token: 'abc' }),
        })
        render(<SignupForm />)
        fireEvent.change(screen.getByLabelText(/display name/i), { target: { value: 'Bob' } })
        fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'bob' } })
        fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'pass' } })
        fireEvent.submit(screen.getByRole('button', { name: /sign up/i }).closest('form')!)
        await waitFor(() => {
            expect(mockLogin).toHaveBeenCalledWith(fakeUser, 'abc')
        })
    })

    it('displays error message on failed signup', async () => {
        ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
            ok: false,
            json: async () => ({ error: 'Username taken' }),
        })
        render(<SignupForm />)
        fireEvent.change(screen.getByLabelText(/display name/i), { target: { value: 'Bob' } })
        fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'bob' } })
        fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'pass' } })
        fireEvent.submit(screen.getByRole('button', { name: /sign up/i }).closest('form')!)
        await waitFor(() => {
            expect(screen.getByText(/Username taken/i)).toBeInTheDocument()
        })
    })

    it('shows "Creating account..." while loading', async () => {
        let resolve: (v: any) => void
        ;(global.fetch as ReturnType<typeof vi.fn>).mockReturnValue(
            new Promise((res) => { resolve = res })
        )
        render(<SignupForm />)
        fireEvent.change(screen.getByLabelText(/display name/i), { target: { value: 'Bob' } })
        fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'bob' } })
        fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'pass' } })
        fireEvent.submit(screen.getByRole('button', { name: /sign up/i }).closest('form')!)
        await waitFor(() => {
            expect(screen.getByRole('button', { name: /creating account/i })).toBeInTheDocument()
        })
        resolve!({ ok: true, json: async () => ({ user: {}, token: '' }) })
    })
})
