import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useStore } from './store'

// Mock localStorage for persist middleware
const localStorageMock = (() => {
    let store: Record<string, string> = {}
    return {
        getItem: vi.fn((key: string) => store[key] ?? null),
        setItem: vi.fn((key: string, value: string) => { store[key] = value }),
        removeItem: vi.fn((key: string) => { delete store[key] }),
        clear: vi.fn(() => { store = {} }),
    }
})()

Object.defineProperty(global, 'localStorage', { value: localStorageMock, writable: true })

function resetStore() {
    useStore.setState({
        items: [],
        sessionUser: null,
        token: null,
        viewedUserId: null,
        isAddSheetOpen: false,
        editingItem: null,
        selectedDate: new Date('2026-03-12'),
    })
}

describe('Zustand store', () => {
    beforeEach(() => {
        resetStore()
        localStorageMock.clear()
    })

    describe('setItems', () => {
        it('replaces the items array', () => {
            const items = [{ id: '1', title: 'Item 1' }, { id: '2', title: 'Item 2' }]
            useStore.getState().setItems(items)
            expect(useStore.getState().items).toEqual(items)
        })

        it('replaces previous items completely', () => {
            useStore.getState().setItems([{ id: '1', title: 'Old' }])
            useStore.getState().setItems([{ id: '2', title: 'New' }])
            expect(useStore.getState().items).toHaveLength(1)
            expect(useStore.getState().items[0].id).toBe('2')
        })
    })

    describe('addItem', () => {
        it('appends a new item to the items array', () => {
            useStore.getState().setItems([{ id: '1', title: 'Existing' }])
            useStore.getState().addItem({ id: '2', title: 'New' })
            expect(useStore.getState().items).toHaveLength(2)
            expect(useStore.getState().items[1].id).toBe('2')
        })

        it('starts with empty array and adds one', () => {
            useStore.getState().addItem({ id: '1', title: 'First' })
            expect(useStore.getState().items).toHaveLength(1)
        })
    })

    describe('updateItem', () => {
        it('updates the matching item by id', () => {
            useStore.getState().setItems([
                { id: '1', title: 'Original', completedAt: null },
                { id: '2', title: 'Other' },
            ])
            useStore.getState().updateItem('1', { completedAt: '2026-03-12T10:00:00.000Z' })
            const updated = useStore.getState().items.find((i) => i.id === '1')
            expect(updated?.completedAt).toBe('2026-03-12T10:00:00.000Z')
        })

        it('leaves other items unchanged', () => {
            useStore.getState().setItems([
                { id: '1', title: 'Item A' },
                { id: '2', title: 'Item B' },
            ])
            useStore.getState().updateItem('1', { title: 'Item A Updated' })
            const untouched = useStore.getState().items.find((i) => i.id === '2')
            expect(untouched?.title).toBe('Item B')
        })
    })

    describe('deleteItem', () => {
        it('removes the item with the matching id', () => {
            useStore.getState().setItems([
                { id: '1', title: 'Keep' },
                { id: '2', title: 'Delete me' },
            ])
            useStore.getState().deleteItem('2')
            expect(useStore.getState().items).toHaveLength(1)
            expect(useStore.getState().items[0].id).toBe('1')
        })

        it('does nothing when id does not exist', () => {
            useStore.getState().setItems([{ id: '1', title: 'Keep' }])
            useStore.getState().deleteItem('non-existent')
            expect(useStore.getState().items).toHaveLength(1)
        })
    })

    describe('login', () => {
        it('sets sessionUser, token, and viewedUserId', () => {
            const user = { id: 'user-1', username: 'alice', role: 'USER' }
            const token = 'jwt-token-123'
            useStore.getState().login(user, token)
            const state = useStore.getState()
            expect(state.sessionUser).toEqual(user)
            expect(state.token).toBe(token)
            expect(state.viewedUserId).toBe('user-1')
        })

        it('resets isAddSheetOpen to false and editingItem to null', () => {
            useStore.setState({ isAddSheetOpen: true, editingItem: { id: '1' } })
            const user = { id: 'user-1', username: 'alice', role: 'USER' }
            useStore.getState().login(user, 'token')
            const state = useStore.getState()
            expect(state.isAddSheetOpen).toBe(false)
            expect(state.editingItem).toBeNull()
        })
    })

    describe('logout', () => {
        it('clears sessionUser, token, and viewedUserId', () => {
            const user = { id: 'user-1', username: 'alice', role: 'USER' }
            useStore.getState().login(user, 'token-abc')
            useStore.getState().logout()
            const state = useStore.getState()
            expect(state.sessionUser).toBeNull()
            expect(state.token).toBeNull()
            expect(state.viewedUserId).toBeNull()
        })

        it('clears items array', () => {
            useStore.getState().setItems([{ id: '1', title: 'Should be gone' }])
            useStore.getState().logout()
            expect(useStore.getState().items).toHaveLength(0)
        })

        it('resets isAddSheetOpen and editingItem', () => {
            useStore.setState({ isAddSheetOpen: true, editingItem: { id: '1' } })
            useStore.getState().logout()
            const state = useStore.getState()
            expect(state.isAddSheetOpen).toBe(false)
            expect(state.editingItem).toBeNull()
        })
    })

    describe('setIsAddSheetOpen', () => {
        it('sets isAddSheetOpen to true', () => {
            useStore.getState().setIsAddSheetOpen(true)
            expect(useStore.getState().isAddSheetOpen).toBe(true)
        })

        it('sets isAddSheetOpen to false', () => {
            useStore.setState({ isAddSheetOpen: true })
            useStore.getState().setIsAddSheetOpen(false)
            expect(useStore.getState().isAddSheetOpen).toBe(false)
        })
    })

    describe('setEditingItem', () => {
        it('sets editingItem', () => {
            const item = { id: '1', title: 'Edit me' }
            useStore.getState().setEditingItem(item)
            expect(useStore.getState().editingItem).toEqual(item)
        })

        it('clears editingItem when set to null', () => {
            useStore.setState({ editingItem: { id: '1' } })
            useStore.getState().setEditingItem(null)
            expect(useStore.getState().editingItem).toBeNull()
        })
    })

    describe('setSelectedDate', () => {
        it('updates selectedDate', () => {
            const newDate = new Date('2026-03-20')
            useStore.getState().setSelectedDate(newDate)
            expect(useStore.getState().selectedDate).toEqual(newDate)
        })

        it('sets selectedDate to null', () => {
            useStore.getState().setSelectedDate(null)
            expect(useStore.getState().selectedDate).toBeNull()
        })
    })
})
