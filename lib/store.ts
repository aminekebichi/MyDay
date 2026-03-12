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
    token: string | null;
    setSessionUser: (user: any | null) => void;
    login: (user: any, token: string) => void;
    logout: () => void;

    viewedUserId: string | null;
    setViewedUserId: (id: string | null) => void;

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

    sessionUser: typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('myday_user') || 'null') : null,
    token: typeof window !== 'undefined' ? localStorage.getItem('myday_session_token') : null,
    setSessionUser: (user) => set({ sessionUser: user }),
    login: (user, token) => {
        localStorage.setItem('myday_session_token', token);
        localStorage.setItem('myday_user', JSON.stringify(user));
        set({ sessionUser: user, token, viewedUserId: user.id });
    },
    logout: () => {
        localStorage.removeItem('myday_session_token');
        localStorage.removeItem('myday_user');
        set({ sessionUser: null, token: null, viewedUserId: null, items: [] });
    },

    viewedUserId: typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('myday_user') || 'null')?.id : null,
    setViewedUserId: (id) => set({ viewedUserId: id }),

    isAddSheetOpen: false,
    setIsAddSheetOpen: (open) => set({ isAddSheetOpen: open }),

    editingItem: null,
    setEditingItem: (item) => set({ editingItem: item }),

    selectedDate: new Date(),
    setSelectedDate: (date) => set({ selectedDate: date }),
}));
