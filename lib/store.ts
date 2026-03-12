import { create } from 'zustand';

// Temporary item type until we have the full Prisma client generated
type Item = any;

interface StoreState {
    items: Item[];
    setItems: (items: Item[]) => void;
    addItem: (item: Item) => void;
    updateItem: (id: string, updates: Partial<Item>) => void;
    deleteItem: (id: string) => void;

    sessionUser: any | null;
    setSessionUser: (user: any) => void;

    isAddSheetOpen: boolean;
    setIsAddSheetOpen: (open: boolean) => void;

    editingItem: Item | null;
    setEditingItem: (item: Item | null) => void;

    selectedDate: Date;
    setSelectedDate: (date: Date) => void;
}

export const useStore = create<StoreState>((set) => ({
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
    setSessionUser: (user) => set({ sessionUser: user }),

    isAddSheetOpen: false,
    setIsAddSheetOpen: (open) => set({ isAddSheetOpen: open }),

    editingItem: null,
    setEditingItem: (item) => set({ editingItem: item }),

    selectedDate: new Date(),
    setSelectedDate: (date) => set({ selectedDate: date }),
}));
