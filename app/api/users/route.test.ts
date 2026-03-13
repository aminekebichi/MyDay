// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

vi.mock('../../../lib/session', () => ({
    validateSession: vi.fn(),
}))

vi.mock('../../../lib/db', () => ({
    prisma: {
        user: { findMany: vi.fn() },
    },
}))

import { GET } from './route'
import { validateSession } from '../../../lib/session'
import { prisma } from '../../../lib/db'

const mockValidateSession = validateSession as ReturnType<typeof vi.fn>
const mockPrisma = prisma as any

function makeRequest(): NextRequest {
    return new NextRequest('http://localhost/api/users', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
    })
}

const fakeAdmin = { id: 'admin-1', username: 'admin', role: 'ADMIN' }
const fakeUser = { id: 'user-1', username: 'alice', role: 'USER' }

const fakeUsers = [
    { id: 'user-1', displayName: 'Alice', username: 'alice', role: 'USER' },
    { id: 'user-2', displayName: 'Bob', username: 'bob', role: 'USER' },
]

describe('GET /api/users', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('returns 401 when not authenticated', async () => {
        mockValidateSession.mockResolvedValue(null)
        const res = await GET(makeRequest())
        expect(res.status).toBe(401)
    })

    it('returns 401 when authenticated as a non-admin user', async () => {
        mockValidateSession.mockResolvedValue(fakeUser)
        const res = await GET(makeRequest())
        expect(res.status).toBe(401)
        const body = await res.json()
        expect(body.code).toBe('UNAUTHORIZED')
    })

    it('returns list of users for an admin', async () => {
        mockValidateSession.mockResolvedValue(fakeAdmin)
        mockPrisma.user.findMany.mockResolvedValue(fakeUsers)
        const res = await GET(makeRequest())
        expect(res.status).toBe(200)
        const body = await res.json()
        expect(body).toHaveLength(2)
        expect(body[0].username).toBe('alice')
    })

    it('returns 500 when the database throws', async () => {
        mockValidateSession.mockResolvedValue(fakeAdmin)
        mockPrisma.user.findMany.mockRejectedValue(new Error('DB error'))
        const res = await GET(makeRequest())
        expect(res.status).toBe(500)
        const body = await res.json()
        expect(body.code).toBe('INTERNAL_ERROR')
    })
})
