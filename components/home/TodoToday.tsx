"use client";

import { useMemo } from 'react';
import { isSameDay, startOfDay, isToday, format } from 'date-fns';
import { useStore } from '../../lib/store';
import { PRIORITY_ORDER } from '../../lib/constants';
import { ItemRow } from '../shared/ItemRow';

type Item = any;

export function TodoToday() {
    const items = useStore((state) => state.items);
    const setEditingItem = useStore((state) => state.setEditingItem);
    const selectedDate = useStore((state) => state.selectedDate);

    const activeDate = startOfDay(selectedDate ?? new Date());

    const todayItems = useMemo(() => {
        return items
            .filter((item: Item) => isSameDay(new Date(item.date), activeDate))
            .sort((a: Item, b: Item) => {
                const pA = PRIORITY_ORDER[a.priority as keyof typeof PRIORITY_ORDER] ?? 99;
                const pB = PRIORITY_ORDER[b.priority as keyof typeof PRIORITY_ORDER] ?? 99;
                if (pA !== pB) return pA - pB;
                const tA = a.startTime ? new Date(a.startTime).getTime() : Number.MAX_SAFE_INTEGER;
                const tB = b.startTime ? new Date(b.startTime).getTime() : Number.MAX_SAFE_INTEGER;
                return tA - tB;
            });
    }, [items, activeDate]);

    const completedCount = todayItems.filter((item: Item) => !!item.completedAt).length;
    const headingLabel = isToday(activeDate) ? 'Today' : format(activeDate, 'EEEE, MMM d');

    return (
        <section aria-label={`Tasks for ${headingLabel}`}>
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
                </div>
            ) : (
                <ul className="space-y-2 px-4">
                    {todayItems.map((item: Item) => (
                        <li key={item.id} onClick={() => setEditingItem(item)} className="cursor-pointer">
                            <ItemRow item={item} />
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}
