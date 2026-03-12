"use client";

import { useMemo } from 'react';
import { format, isSameDay, isToday, startOfDay } from 'date-fns';
import { useStore } from '../../lib/store';
import { PRIORITY_ORDER } from '../../lib/constants';
import { ItemRow } from '../shared/ItemRow';

// To avoid TS errors until Prisma client is generated
type Item = any;

export function TodoToday() {
    const items = useStore((state: any) => state.items);
    const updateItem = useStore((state: any) => state.updateItem);
    const setEditingItem = useStore((state: any) => state.setEditingItem);
    const selectedDate = useStore((state: any) => state.selectedDate);

    const activeDate = startOfDay(selectedDate ?? new Date());

    const todayItems = useMemo(() => {
        return items
            .filter((item: Item) => isSameDay(new Date(item.date), activeDate))
            .sort((a: Item, b: Item) => {
                // Completed items go to the bottom
                if (!!a.completedAt !== !!b.completedAt) {
                    return a.completedAt ? 1 : -1;
                }
                // Then by priority
                const pA = PRIORITY_ORDER[a.priority as keyof typeof PRIORITY_ORDER] ?? 99;
                const pB = PRIORITY_ORDER[b.priority as keyof typeof PRIORITY_ORDER] ?? 99;
                if (pA !== pB) return pA - pB;
                // Then by start time
                const tA = a.startTime ? new Date(a.startTime).getTime() : Number.MAX_SAFE_INTEGER;
                const tB = b.startTime ? new Date(b.startTime).getTime() : Number.MAX_SAFE_INTEGER;
                return tA - tB;
            });
    }, [items, activeDate]);

    const completedCount = todayItems.filter((item: Item) => !!item.completedAt).length;

    // Implements #9: complete/uncomplete a task with optimistic update + rollback
    const handleToggle = async (id: string, completedAt: string | null) => {
        // Store the previous value for potential rollback
        const previous = items.find((item: Item) => item.id === id)?.completedAt ?? null;

        // Optimistic update
        updateItem(id, { completedAt });

        try {
            const res = await fetch(`/api/items/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Session-Token': 'usr_test_123',
                },
                body: JSON.stringify({ completedAt }),
            });

            if (!res.ok) throw new Error('Failed to update item');
        } catch {
            // Rollback
            updateItem(id, { completedAt: previous });
        }
    };

    const headingLabel = isToday(activeDate) ? 'Today' : format(activeDate, 'EEEE, MMM d');

    return (
        <section aria-label={`Tasks for ${headingLabel}`}>
            {/* Section header */}
            <div className="px-4 pt-5 pb-3 flex items-baseline justify-between">
                <h2 className="text-lg font-instrument" style={{ color: 'var(--text-primary)' }}>
                    {headingLabel}
                </h2>
                {todayItems.length > 0 && (
                    <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                        {completedCount}/{todayItems.length} done
                    </span>
                )}
            </div>

            {todayItems.length === 0 ? (
                <div className="px-4 py-8 text-center">
                    <p className="font-caveat text-xl" style={{ color: 'var(--text-muted)' }}>
                        Nothing scheduled.
                    </p>
                    <p className="font-caveat text-base mt-1" style={{ color: 'var(--text-muted)' }}>
                        Tap + to add something.
                    </p>
                </div>
            ) : (
                <ul>
                    {todayItems.map((item: Item) => (
                        <li key={item.id}>
                            <ItemRow item={item} onToggle={handleToggle} onEdit={setEditingItem} />
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}
