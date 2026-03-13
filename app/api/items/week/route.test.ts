// @vitest-environment node
// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { startOfDay } from 'date-fns'

vi.mock('../../../../lib/session', () => ({
    validateSession: vi.fn(),
}))

vi.mock('../../../../lib/db', () => ({
    prisma: {
        item: { findMany: vi.fn() },
    },
}))

import { GET } from './route'
import { validateSession } from '../../../../lib/session'
import { prisma } from '../../../../lib/db'

const mockValidateSession = validateSession as ReturnType<typeof vi.fn>
const mockPrisma = prisma as any

function makeRequest(url: string, token?: string): NextRequest {
    return new NextRequest(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'X-Session-Token': token } : {}),
        },
    })
}

const fakeUser = { id: 'user-1', username: 'alice', role: 'USER' }
const fakeAdmin = { id: 'admin-1', username: 'admin', role: 'ADMIN' }

const fakeItems = [
    {
        id: 'item-1',
        title: 'Weekly meeting',
        userId: 'user-1',
        type: 'MEETING',
        priority: 'IMPORTANT',
        date: new Date('2026-03-13'),
        user: { displayName: 'Alice Wonder' },
    },
]

describe('GET /api/items/week', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('returns 401 when not authenticated', async () => {
        mockValidateSession.mockResolvedValue(null)
        const req = makeRequest('http://localhost/api/items/week')
        const res = await GET(req)
        expect(res.status).toBe(401)
    })

    it('regular user fetches own items in date range', async () => {
        mockValidateSession.mockResolvedValue(fakeUser)
        mockPrisma.item.findMany.mockResolvedValue(fakeItems)
        const req = makeRequest('http://localhost/api/items/week', 'token')
        const res = await GET(req)
        expect(res.status).toBe(200)
        const call = mockPrisma.item.findMany.mock.calls[0][0]
        expect(call.where.userId).toBe('user-1')
        expect(call.where.date).toBeDefined()
        expect(call.where.date.gte).toBeDefined()
        expect(call.where.date.lte).toBeDefined()
    })

    it('admin with userId param fetches that user items', async () => {
        mockValidateSession.mockResolvedValue(fakeAdmin)
        mockPrisma.item.findMany.mockResolvedValue([])
        const req = makeRequest('http://localhost/api/items/week?userId=user-2', 'token')
        const res = await GET(req)
        expect(res.status).toBe(200)
        const call = mockPrisma.item.findMany.mock.calls[0][0]
        expect(call.where.userId).toBe('user-2')
    })

    it('admin with global=true fetches all users (no userId filter)', async () => {
        mockValidateSession.mockResolvedValue(fakeAdmin)
        mockPrisma.item.findMany.mockResolvedValue([])
        const req = makeRequest('http://localhost/api/items/week?global=true', 'token')
        const res = await GET(req)
        expect(res.status).toBe(200)
        const call = mockPrisma.item.findMany.mock.calls[0][0]
        expect(call.where.userId).toBeUndefined()
    })

    it('start param controls the date range start', async () => {
        mockValidateSession.mockResolvedValue(fakeUser)
        mockPrisma.item.findMany.mockResolvedValue([])
        const startDate = '2026-03-20'
        const req = makeRequest(`http://localhost/api/items/week?start=${startDate}`, 'token')
        const res = await GET(req)
        expect(res.status).toBe(200)
        const call = mockPrisma.item.findMany.mock.calls[0][0]
        // The gte date should match startOfDay of the provided start date
        const gteDate: Date = call.where.date.gte
        const expected = startOfDay(new Date('2026-03-20'))
        expect(gteDate.getTime()).toBe(expected.getTime())
    })

    it('returns items with user.displayName included', async () => {
        mockValidateSession.mockResolvedValue(fakeUser)
        mockPrisma.item.findMany.mockResolvedValue(fakeItems)
        const req = makeRequest('http://localhost/api/items/week', 'token')
        const res = await GET(req)
        expect(res.status).toBe(200)
        const body = await res.json()
        // findMany is called with include for user.displayName
        const call = mockPrisma.item.findMany.mock.calls[0][0]
        expect(call.include).toBeDefined()
        expect(call.include.user).toBeDefined()
        expect(call.include.user.select.displayName).toBe(true)
    })
})
