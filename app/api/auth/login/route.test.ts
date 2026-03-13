// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

vi.mock('../../../../lib/db', () => ({
    prisma: {
        user: { findUnique: vi.fn() },
    },
}))

vi.mock('bcryptjs', () => ({
    default: { compareSync: vi.fn() },
    compareSync: vi.fn(),
}))

import { POST } from './route'
import { prisma } from '../../../../lib/db'
import bcrypt from 'bcryptjs'

const mockPrisma = prisma as any
const mockBcrypt = bcrypt as any

function makeRequest(body: object): NextRequest {
    return new NextRequest('http://localhost/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    })
}

const fakeUser = {
    id: 'user-1',
    username: 'alice',
    displayName: 'Alice Wonder',
    passwordHash: '$2b$10$hashedpassword',
    role: 'USER',
    theme: 'dark',
}

describe('POST /api/auth/login', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('returns 400 when username is missing', async () => {
        const req = makeRequest({ password: 'secret' })
        const res = await POST(req)
        expect(res.status).toBe(400)
        const body = await res.json()
        expect(body.code).toBe('BAD_REQUEST')
    })

    it('returns 400 when password is missing', async () => {
        const req = makeRequest({ username: 'alice' })
        const res = await POST(req)
        expect(res.status).toBe(400)
        const body = await res.json()
        expect(body.code).toBe('BAD_REQUEST')
    })

    it('returns 401 when user is not found', async () => {
        mockPrisma.user.findUnique.mockResolvedValue(null)
        const req = makeRequest({ username: 'unknown', password: 'secret' })
        const res = await POST(req)
        expect(res.status).toBe(401)
        const body = await res.json()
        expect(body.code).toBe('UNAUTHORIZED')
    })

    it('returns 401 when password is wrong', async () => {
        mockPrisma.user.findUnique.mockResolvedValue(fakeUser)
        mockBcrypt.compareSync.mockReturnValue(false)
        const req = makeRequest({ username: 'alice', password: 'wrongpass' })
        const res = await POST(req)
        expect(res.status).toBe(401)
        const body = await res.json()
        expect(body.code).toBe('UNAUTHORIZED')
    })

    it('returns 200 with token and user on valid credentials', async () => {
        mockPrisma.user.findUnique.mockResolvedValue(fakeUser)
        mockBcrypt.compareSync.mockReturnValue(true)
        const req = makeRequest({ username: 'alice', password: 'correctpass' })
        const res = await POST(req)
        expect(res.status).toBe(200)
        const body = await res.json()
        expect(typeof body.token).toBe('string')
        expect(body.token.length).toBeGreaterThan(0)
        expect(body.user.id).toBe('user-1')
        expect(body.user.username).toBe('alice')
        expect(body.user.displayName).toBe('Alice Wonder')
        expect(body.user.role).toBe('USER')
    })

    it('returns 500 when database throws an error', async () => {
        mockPrisma.user.findUnique.mockRejectedValue(new Error('DB connection failed'))
        const req = makeRequest({ username: 'alice', password: 'secret' })
        const res = await POST(req)
        expect(res.status).toBe(500)
        const body = await res.json()
        expect(body.code).toBe('INTERNAL_ERROR')
    })
})
