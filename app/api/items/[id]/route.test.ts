// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

vi.mock('../../../../lib/session', () => ({
    validateSession: vi.fn(),
}))

vi.mock('../../../../lib/db', () => ({
    prisma: {
        item: { findUnique: vi.fn(), update: vi.fn(), delete: vi.fn() },
    },
}))

import { PATCH, DELETE } from './route'
import { validateSession } from '../../../../lib/session'
import { prisma } from '../../../../lib/db'

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
const fakeItem = {
    id: 'item-1',
    userId: 'user-1',
    title: 'Buy milk',
    type: 'TASK',
    priority: 'ROUTINE',
    date: new Date('2026-03-12'),
    completedAt: null,
}

const routeParams = { params: { id: 'item-1' } }

describe('PATCH /api/items/[id]', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('returns 401 when not authenticated', async () => {
        mockValidateSession.mockResolvedValue(null)
        const req = makeRequest('PATCH', 'http://localhost/api/items/item-1', { completedAt: null })
        const res = await PATCH(req, routeParams)
        expect(res.status).toBe(401)
    })

    it('returns 404 when item is not found', async () => {
        mockValidateSession.mockResolvedValue(fakeUser)
        mockPrisma.item.findUnique.mockResolvedValue(null)
        const req = makeRequest('PATCH', 'http://localhost/api/items/item-1', { completedAt: null }, 'token')
        const res = await PATCH(req, routeParams)
        expect(res.status).toBe(404)
        const body = await res.json()
        expect(body.code).toBe('NOT_FOUND')
    })

    it('returns 403 when item is owned by a different user and requester is not admin', async () => {
        mockValidateSession.mockResolvedValue({ id: 'user-2', username: 'bob', role: 'USER' })
        mockPrisma.item.findUnique.mockResolvedValue(fakeItem)
        const req = makeRequest('PATCH', 'http://localhost/api/items/item-1', { completedAt: null }, 'token')
        const res = await PATCH(req, routeParams)
        expect(res.status).toBe(403)
        const body = await res.json()
        expect(body.code).toBe('FORBIDDEN')
    })

    it('returns 200 with updated item when owner updates', async () => {
        mockValidateSession.mockResolvedValue(fakeUser)
        mockPrisma.item.findUnique.mockResolvedValue(fakeItem)
        const updatedItem = { ...fakeItem, completedAt: new Date('2026-03-12T10:00:00.000Z') }
        mockPrisma.item.update.mockResolvedValue(updatedItem)
        const req = makeRequest(
            'PATCH',
            'http://localhost/api/items/item-1',
            { completedAt: '2026-03-12T10:00:00.000Z' },
            'token'
        )
        const res = await PATCH(req, routeParams)
        expect(res.status).toBe(200)
    })

    it('admin can update any item regardless of ownership', async () => {
        mockValidateSession.mockResolvedValue(fakeAdmin)
        mockPrisma.item.findUnique.mockResolvedValue(fakeItem) // owned by user-1
        const updatedItem = { ...fakeItem, title: 'Updated by admin' }
        mockPrisma.item.update.mockResolvedValue(updatedItem)
        const req = makeRequest(
            'PATCH',
            'http://localhost/api/items/item-1',
            { title: 'Updated by admin' },
            'token'
        )
        const res = await PATCH(req, routeParams)
        expect(res.status).toBe(200)
    })

    it('returns 400 VALIDATION_ERROR for invalid payload', async () => {
        mockValidateSession.mockResolvedValue(fakeUser)
        mockPrisma.item.findUnique.mockResolvedValue(fakeItem)
        const req = makeRequest(
            'PATCH',
            'http://localhost/api/items/item-1',
            { priority: 'SUPER_HIGH' }, // invalid enum value
            'token'
        )
        const res = await PATCH(req, routeParams)
        expect(res.status).toBe(400)
        const body = await res.json()
        expect(body.code).toBe('VALIDATION_ERROR')
    })
})

describe('DELETE /api/items/[id]', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('returns 401 when not authenticated', async () => {
        mockValidateSession.mockResolvedValue(null)
        const req = makeRequest('DELETE', 'http://localhost/api/items/item-1')
        const res = await DELETE(req, routeParams)
        expect(res.status).toBe(401)
    })

    it('returns 404 when item is not found', async () => {
        mockValidateSession.mockResolvedValue(fakeUser)
        mockPrisma.item.findUnique.mockResolvedValue(null)
        const req = makeRequest('DELETE', 'http://localhost/api/items/item-1', undefined, 'token')
        const res = await DELETE(req, routeParams)
        expect(res.status).toBe(404)
    })

    it('returns 403 when user does not own the item and is not admin', async () => {
        mockValidateSession.mockResolvedValue({ id: 'user-2', username: 'bob', role: 'USER' })
        mockPrisma.item.findUnique.mockResolvedValue(fakeItem)
        const req = makeRequest('DELETE', 'http://localhost/api/items/item-1', undefined, 'token')
        const res = await DELETE(req, routeParams)
        expect(res.status).toBe(403)
    })

    it('returns 204 when owner deletes their item', async () => {
        mockValidateSession.mockResolvedValue(fakeUser)
        mockPrisma.item.findUnique.mockResolvedValue(fakeItem)
        mockPrisma.item.delete.mockResolvedValue(fakeItem)
        const req = makeRequest('DELETE', 'http://localhost/api/items/item-1', undefined, 'token')
        const res = await DELETE(req, routeParams)
        expect(res.status).toBe(204)
    })

    it('admin can delete any item', async () => {
        mockValidateSession.mockResolvedValue(fakeAdmin)
        mockPrisma.item.findUnique.mockResolvedValue(fakeItem) // owned by user-1
        mockPrisma.item.delete.mockResolvedValue(fakeItem)
        const req = makeRequest('DELETE', 'http://localhost/api/items/item-1', undefined, 'token')
        const res = await DELETE(req, routeParams)
        expect(res.status).toBe(204)
    })
})
