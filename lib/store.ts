import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Temporary item type
type Item = any;

interface StoreState {
    items: Item[];
    setItems: (items: Item[]) => void;
    addItem: (item: Item) => void;
    updateItem: (id: string, updates: Partial<Item>) => void;
    deleteItem: (id: string) => void;

    sessionUser: any | null;
    token: string | null;
    login: (user: any, token: string) => void;
    logout: () => void;
    
    viewedUserId: string | null;
    setViewedUserId: (id: string | null) => void;

    isAddSheetOpen: boolean;
    setIsAddSheetOpen: (open: boolean) => void;

    editingItem: Item | null;
    setEditingItem: (item: Item | null) => void;

    selectedDate: Date | null;
    setSelectedDate: (date: Date | null) => void;
}

export const useStore = create<StoreState>()(
    persist(
        (set) => ({
            items: [],
            setItems: (items) => set({ items }),
            addItem: (item) => set((state) => ({ items: [...state.items, item] })),
            updateItem: (id, updates) => set((state) => ({
                items: state.items.map(item => item.id === id ? { ...item, ...updates } : item)
            })),
            deleteItem: (id) => set((state) => ({
                items: state.items.filter(item => item.id !== id)
            })),

            sessionUser: null,
            token: null,
            login: (user, token) => set({ sessionUser: user, token, viewedUserId: user.id, isAddSheetOpen: false, editingItem: null }),
            logout: () => set({ sessionUser: null, token: null, viewedUserId: null, items: [], isAddSheetOpen: false, editingItem: null }),

            viewedUserId: null,
            setViewedUserId: (id) => set({ viewedUserId: id }),

            isAddSheetOpen: false,
            setIsAddSheetOpen: (open) => set({ isAddSheetOpen: open }),

            editingItem: null,
            setEditingItem: (item) => set({ editingItem: item }),

            selectedDate: new Date(),
            setSelectedDate: (date) => set({ selectedDate: date }),
        }),
        {
            name: 'myday-storage',
            partialize: (state) => ({
                sessionUser: state.sessionUser,
                token: state.token,
                viewedUserId: state.viewedUserId,
            }),
        }
    )
);
