// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

vi.mock('../../../../lib/db', () => ({
    prisma: {
        user: { findUnique: vi.fn(), create: vi.fn() },
    },
}))

vi.mock('bcryptjs', () => ({
    default: { compareSync: vi.fn(), hashSync: vi.fn() },
    compareSync: vi.fn(),
    hashSync: vi.fn(),
}))

import { POST } from './route'
import { prisma } from '../../../../lib/db'
import bcrypt from 'bcryptjs'

const mockPrisma = prisma as any
const mockBcrypt = bcrypt as any

function makeRequest(body: object): NextRequest {
    return new NextRequest('http://localhost/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    })
}

const createdUser = {
    id: 'user-new',
    username: 'newuser',
    displayName: 'New User',
    passwordHash: '$2b$10$hashed',
    role: 'USER',
    theme: 'dark',
    lastOpenedAt: new Date(),
}

describe('POST /api/auth/signup', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        mockBcrypt.hashSync.mockReturnValue('$2b$10$hashed')
    })

    it('returns 400 when username is missing', async () => {
        const req = makeRequest({ password: 'secret123', displayName: 'New User' })
        const res = await POST(req)
        expect(res.status).toBe(400)
        const body = await res.json()
        expect(body.code).toBe('BAD_REQUEST')
    })

    it('returns 400 when password is missing', async () => {
        const req = makeRequest({ username: 'newuser', displayName: 'New User' })
        const res = await POST(req)
        expect(res.status).toBe(400)
        const body = await res.json()
        expect(body.code).toBe('BAD_REQUEST')
    })

    it('returns 400 when displayName is missing', async () => {
        const req = makeRequest({ username: 'newuser', password: 'secret123' })
        const res = await POST(req)
        expect(res.status).toBe(400)
        const body = await res.json()
        expect(body.code).toBe('BAD_REQUEST')
    })

    it('returns 409 when username is already taken', async () => {
        mockPrisma.user.findUnique.mockResolvedValue({ id: 'existing-user', username: 'newuser' })
        const req = makeRequest({ username: 'newuser', password: 'secret123', displayName: 'New User' })
        const res = await POST(req)
        expect(res.status).toBe(409)
        const body = await res.json()
        expect(body.code).toBe('CONFLICT')
    })

    it('returns 200 with token and user on valid signup', async () => {
        mockPrisma.user.findUnique.mockResolvedValue(null)
        mockPrisma.user.create.mockResolvedValue(createdUser)
        const req = makeRequest({
            username: 'newuser',
            password: 'secret123',
            displayName: 'New User',
        })
        const res = await POST(req)
        expect(res.status).toBe(200)
        const body = await res.json()
        expect(typeof body.token).toBe('string')
        expect(body.token.length).toBeGreaterThan(0)
        expect(body.user.id).toBe('user-new')
        expect(body.user.username).toBe('newuser')
        expect(body.user.displayName).toBe('New User')
        expect(body.user.role).toBe('USER')
    })

    it('returns 500 when database throws an error during create', async () => {
        mockPrisma.user.findUnique.mockResolvedValue(null)
        mockPrisma.user.create.mockRejectedValue(new Error('DB error'))
        const req = makeRequest({
            username: 'newuser',
            password: 'secret123',
            displayName: 'New User',
        })
        const res = await POST(req)
        expect(res.status).toBe(500)
        const body = await res.json()
        expect(body.code).toBe('INTERNAL_ERROR')
    })
})
