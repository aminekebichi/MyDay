// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { NextRequest } from 'next/server'
import { SignJWT } from 'jose'
import { validateSession } from './session'

const TEST_SECRET = new TextEncoder().encode('super-secret-default-key')

async function makeToken(
    payload: { id: string; username: string; role: string },
    expirationTime = '1h'
) {
    return new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(expirationTime)
        .sign(TEST_SECRET)
}

function makeRequest(token?: string): NextRequest {
    return new NextRequest('http://localhost/api/test', {
        method: 'GET',
        headers: token ? { 'X-Session-Token': token } : {},
    })
}

describe('validateSession', () => {
    it('returns null when no X-Session-Token header is present', async () => {
        const req = makeRequest()
        const result = await validateSession(req)
        expect(result).toBeNull()
    })

    it('returns null for a garbage/invalid token', async () => {
        const req = makeRequest('this-is-not-a-jwt')
        const result = await validateSession(req)
        expect(result).toBeNull()
    })

    it('returns null for an expired token', async () => {
        const token = await makeToken(
            { id: 'user-1', username: 'alice', role: 'USER' },
            '-1s' // expired 1 second in the past
        )
        const req = makeRequest(token)
        const result = await validateSession(req)
        expect(result).toBeNull()
    })

    it('returns { id, username, role } for a valid USER token', async () => {
        const token = await makeToken({ id: 'user-1', username: 'alice', role: 'USER' })
        const req = makeRequest(token)
        const result = await validateSession(req)
        expect(result).not.toBeNull()
        expect(result?.id).toBe('user-1')
        expect(result?.username).toBe('alice')
        expect(result?.role).toBe('USER')
    })

    it('returns role ADMIN for a valid ADMIN token', async () => {
        const token = await makeToken({ id: 'admin-1', username: 'admin', role: 'ADMIN' })
        const req = makeRequest(token)
        const result = await validateSession(req)
        expect(result).not.toBeNull()
        expect(result?.role).toBe('ADMIN')
        expect(result?.id).toBe('admin-1')
    })
})
