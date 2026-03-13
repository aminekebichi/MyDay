// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

vi.mock('../../../lib/session', () => ({
    validateSession: vi.fn(),
}))

vi.mock('../../../lib/db', () => ({
    prisma: {
        item: { findMany: vi.fn(), create: vi.fn() },
    },
}))

import { GET, POST } from './route'
import { validateSession } from '../../../lib/session'
import { prisma } from '../../../lib/db'

const mockValidateSession = validateSession as ReturnType<typeof vi.fn>
const mockPrisma = prisma as any

function makeRequest(
    method: string,
    url: string,
    body?: object,
    token?: string
): NextRequest {
    return new NextRequest(url, {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'X-Session-Token': token } : {}),
        },
        body: body ? JSON.stringify(body) : undefined,
    })
}

const fakeUser = { id: 'user-1', username: 'alice', role: 'USER' }
const fakeAdmin = { id: 'admin-1', username: 'admin', role: 'ADMIN' }
const fakeItems = [
    { id: 'item-1', title: 'Buy milk', userId: 'user-1', priority: 'ROUTINE', type: 'TASK' },
]

const validItemPayload = {
    title: 'Buy groceries',
    type: 'TASK',
    priority: 'ROUTINE',
    date: '2026-03-12T00:00:00.000Z',
}

describe('GET /api/items', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('returns 401 when not authenticated', async () => {
        mockValidateSession.mockResolvedValue(null)
        const req = makeRequest('GET', 'http://localhost/api/items')
        const res = await GET(req)
        expect(res.status).toBe(401)
    })

    it('returns all user items when no date filter', async () => {
        mockValidateSession.mockResolvedValue(fakeUser)
        mockPrisma.item.findMany.mockResolvedValue(fakeItems)
        const req = makeRequest('GET', 'http://localhost/api/items', undefined, 'token')
        const res = await GET(req)
        expect(res.status).toBe(200)
        const body = await res.json()
        expect(Array.isArray(body)).toBe(true)
        expect(mockPrisma.item.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
                where: expect.objectContaining({ userId: 'user-1' }),
            })
        )
    })

    it('applies date filter when date param provided', async () => {
        mockValidateSession.mockResolvedValue(fakeUser)
        mockPrisma.item.findMany.mockResolvedValue([])
        const req = makeRequest('GET', 'http://localhost/api/items?date=2026-03-12', undefined, 'token')
        const res = await GET(req)
        expect(res.status).toBe(200)
        const call = mockPrisma.item.findMany.mock.calls[0][0]
        expect(call.where.date).toBeDefined()
        expect(call.where.date.gte).toBeDefined()
        expect(call.where.date.lte).toBeDefined()
    })

    it('admin with userId param fetches that user items', async () => {
        mockValidateSession.mockResolvedValue(fakeAdmin)
        mockPrisma.item.findMany.mockResolvedValue([])
        const req = makeRequest('GET', 'http://localhost/api/items?userId=user-2', undefined, 'token')
        const res = await GET(req)
        expect(res.status).toBe(200)
        const call = mockPrisma.item.findMany.mock.calls[0][0]
        expect(call.where.userId).toBe('user-2')
    })
})

describe('POST /api/items', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('returns 401 when not authenticated', async () => {
        mockValidateSession.mockResolvedValue(null)
        const req = makeRequest('POST', 'http://localhost/api/items', validItemPayload)
        const res = await POST(req)
        expect(res.status).toBe(401)
    })

    it('creates and returns a new item with 201 on valid payload', async () => {
        mockValidateSession.mockResolvedValue(fakeUser)
        const createdItem = { id: 'item-new', ...validItemPayload, userId: 'user-1' }
        mockPrisma.item.create.mockResolvedValue(createdItem)
        const req = makeRequest('POST', 'http://localhost/api/items', validItemPayload, 'token')
        const res = await POST(req)
        expect(res.status).toBe(201)
        const body = await res.json()
        expect(body.id).toBe('item-new')
    })

    it('returns 400 VALIDATION_ERROR when title is missing', async () => {
        mockValidateSession.mockResolvedValue(fakeUser)
        const { title: _t, ...invalid } = validItemPayload
        const req = makeRequest('POST', 'http://localhost/api/items', invalid, 'token')
        const res = await POST(req)
        expect(res.status).toBe(400)
        const body = await res.json()
        expect(body.code).toBe('VALIDATION_ERROR')
    })

    it('admin with userId in body sets targetUserId to body.userId', async () => {
        mockValidateSession.mockResolvedValue(fakeAdmin)
        const createdItem = { id: 'item-new', ...validItemPayload, userId: 'user-2' }
        mockPrisma.item.create.mockResolvedValue(createdItem)
        const req = makeRequest(
            'POST',
            'http://localhost/api/items',
            { ...validItemPayload, userId: 'user-2' },
            'token'
        )
        const res = await POST(req)
        expect(res.status).toBe(201)
        const call = mockPrisma.item.create.mock.calls[0][0]
        expect(call.data.userId).toBe('user-2')
    })

    it('returns 500 on database error', async () => {
        mockValidateSession.mockResolvedValue(fakeUser)
        mockPrisma.item.create.mockRejectedValue(new Error('DB error'))
        const req = makeRequest('POST', 'http://localhost/api/items', validItemPayload, 'token')
        const res = await POST(req)
        expect(res.status).toBe(500)
        const body = await res.json()
        expect(body.code).toBe('INTERNAL_ERROR')
    })
})
