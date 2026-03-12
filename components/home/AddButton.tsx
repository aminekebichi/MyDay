"use client";

import { useStore } from '../../lib/store';

// Implements #11: sticky "Add to MyDay" pill button
export function AddButton() {
    const setIsOpen = useStore((state: any) => state.setIsAddSheetOpen);

    return (
        <button
            type="button"
            onClick={() => setIsOpen(true)}
            aria-label="Add item to MyDay"
            className="fixed bottom-0 inset-x-0 flex items-center justify-center gap-2 py-6 text-sm font-mono shadow-lg transition-opacity active:opacity-80"
            style={{
                backgroundColor: 'var(--accent)',
                color: '#fff',
                zIndex: 40,
            }}
        >
            <span aria-hidden="true" className="text-lg leading-none">+</span>
            <span>Add to MyDay</span>
        </button>
    );
}
