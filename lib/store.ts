import { create } from 'zustand';

// Temporary item type until we have the full Prisma client generated
type Item = any;

interface StoreState {
    items: Item[];
    setItems: (items: Item[]) => void;
    mergeItems: (newItems: Item[]) => void;
    addItem: (item: Item) => void;
    updateItem: (id: string, updates: Partial<Item>) => void;
    deleteItem: (id: string) => void;

    sessionUser: any | null;
    setSessionUser: (user: any) => void;

    selectedDate: Date | null;
    setSelectedDate: (date: Date) => void;
}

export const useStore = create<StoreState>((set) => ({
    items: [],
    setItems: (items) => set({ items }),
    mergeItems: (newItems) => set((state) => {
        const itemMap = new Map();
        state.items.forEach(i => itemMap.set(i.id, i));
        newItems.forEach(i => itemMap.set(i.id, i));
        return { items: Array.from(itemMap.values()) };
    }),
    addItem: (item) => set((state) => ({ items: [...state.items, item] })),
    updateItem: (id, updates) => set((state) => ({
        items: state.items.map(item => item.id === id ? { ...item, ...updates } : item)
    })),
    deleteItem: (id) => set((state) => ({
        items: state.items.filter(item => item.id !== id)
    })),

    sessionUser: null,
    setSessionUser: (user) => set({ sessionUser: user }),

    selectedDate: new Date(),
    setSelectedDate: (date) => set({ selectedDate: date }),
}));
