import { describe, it, expect } from 'vitest'
import { CreateItemSchema, UpdateItemSchema } from './schemas'

const validBase = {
    title: 'Buy groceries',
    type: 'TASK',
    priority: 'ROUTINE',
    date: '2026-03-12T00:00:00.000Z',
}

describe('CreateItemSchema', () => {
    it('accepts a valid TASK payload', () => {
        const result = CreateItemSchema.safeParse(validBase)
        expect(result.success).toBe(true)
    })

    it('fails when title is missing', () => {
        const { title: _t, ...rest } = validBase
        const result = CreateItemSchema.safeParse(rest)
        expect(result.success).toBe(false)
        if (!result.success) {
            const messages = result.error.issues.map((i) => i.message)
            expect(messages.some((m) => m.includes('Title is required') || m.includes('Required'))).toBe(true)
        }
    })

    it('fails when title is empty string', () => {
        const result = CreateItemSchema.safeParse({ ...validBase, title: '' })
        expect(result.success).toBe(false)
        if (!result.success) {
            const messages = result.error.issues.map((i) => i.message)
            expect(messages.some((m) => m.includes('Title is required') || m.includes('least 1'))).toBe(true)
        }
    })

    it('fails for an invalid type value', () => {
        const result = CreateItemSchema.safeParse({ ...validBase, type: 'INVALID_TYPE' })
        expect(result.success).toBe(false)
    })

    it('fails for an invalid priority value', () => {
        const result = CreateItemSchema.safeParse({ ...validBase, priority: 'HIGH' })
        expect(result.success).toBe(false)
    })

    it('fails for an invalid date format', () => {
        const result = CreateItemSchema.safeParse({ ...validBase, date: 'not-a-date' })
        expect(result.success).toBe(false)
    })

    it('accepts optional fields: startTime, endTime, notes, attendeeName, location', () => {
        const result = CreateItemSchema.safeParse({
            ...validBase,
            startTime: '2026-03-12T09:00:00.000Z',
            endTime: '2026-03-12T10:00:00.000Z',
            notes: 'Remember milk',
            attendeeName: 'Bob',
            location: 'Office',
        })
        expect(result.success).toBe(true)
    })

    it('accepts a valid joinUrl', () => {
        const result = CreateItemSchema.safeParse({
            ...validBase,
            joinUrl: 'https://meet.example.com/room',
        })
        expect(result.success).toBe(true)
    })

    it('fails for an invalid joinUrl', () => {
        const result = CreateItemSchema.safeParse({
            ...validBase,
            joinUrl: 'not-a-url',
        })
        expect(result.success).toBe(false)
    })

    it('accepts empty string as joinUrl', () => {
        const result = CreateItemSchema.safeParse({
            ...validBase,
            joinUrl: '',
        })
        expect(result.success).toBe(true)
    })

    it('defaults recurrence to NONE when not provided', () => {
        const result = CreateItemSchema.safeParse(validBase)
        expect(result.success).toBe(true)
        if (result.success) {
            expect(result.data.recurrence).toBe('NONE')
        }
    })
})

describe('UpdateItemSchema', () => {
    it('accepts a partial update with only completedAt', () => {
        const result = UpdateItemSchema.safeParse({
            completedAt: '2026-03-12T12:00:00.000Z',
        })
        expect(result.success).toBe(true)
    })

    it('accepts completedAt as null (un-complete)', () => {
        const result = UpdateItemSchema.safeParse({ completedAt: null })
        expect(result.success).toBe(true)
        if (result.success) {
            expect(result.data.completedAt).toBeNull()
        }
    })

    it('accepts an empty object (all fields optional)', () => {
        const result = UpdateItemSchema.safeParse({})
        expect(result.success).toBe(true)
    })

    it('accepts a partial title update', () => {
        const result = UpdateItemSchema.safeParse({ title: 'New title' })
        expect(result.success).toBe(true)
    })

    it('fails when title is explicitly empty string', () => {
        const result = UpdateItemSchema.safeParse({ title: '' })
        expect(result.success).toBe(false)
    })
})
