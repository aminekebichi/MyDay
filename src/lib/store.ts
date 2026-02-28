import { create } from "zustand";

interface Item {
    id: string;
    title: string;
    type: "task" | "assignment" | "event" | "meeting" | "deadline";
    priority: "ROUTINE" | "IMPORTANT" | "CRITICAL";
    date: string;
    startTime?: string;
    endTime?: string;
    completedAt?: string | null;
}

interface MyDayState {
    items: Item[];
    setItems: (items: Item[]) => void;
    addItem: (item: Item) => void;
    updateItem: (id: string, updates: Partial<Item>) => void;
    deleteItem: (id: string) => void;
}

export const useMyDayStore = create<MyDayState>((set) => ({
    items: [],
    setItems: (items) => set({ items }),
    addItem: (item) => set((state) => ({ items: [...state.items, item] })),
    updateItem: (id, updates) =>
        set((state) => ({
            items: state.items.map((item) =>
                item.id === id ? { ...item, ...updates } : item
            ),
        })),
    deleteItem: (id) =>
        set((state) => ({
            items: state.items.filter((item) => item.id !== id),
        })),
}));
