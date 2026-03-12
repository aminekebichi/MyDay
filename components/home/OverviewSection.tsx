"use client";

import { useMemo } from 'react';
import { startOfDay, endOfWeek, isWithinInterval, isSameDay } from 'date-fns';
import { useStore } from '../../lib/store';
import { generateWeekOverview, generateClosingQuip } from '../../lib/overviewQuip';

type Item = any;

export function OverviewSection() {
    const items = useStore((state: any) => state.items);

    const { overview, quip } = useMemo(() => {
        const today = startOfDay(new Date());
        const weekEnd = endOfWeek(today, { weekStartsOn: 1 });

        const relevant = items.filter((item: Item) => {
            const d = startOfDay(new Date(item.date));
            return (
                isWithinInterval(d, { start: today, end: weekEnd }) || isSameDay(d, today)
            );
        });

        return {
            overview: generateWeekOverview(relevant),
            quip: generateClosingQuip(relevant),
        };
    }, [items]);

    return (
        <div className="px-4 py-4 flex flex-col gap-1">
            <p className="font-caveat text-lg leading-snug" style={{ color: 'var(--text-primary)' }}>
                {overview}
            </p>
            <p className="font-caveat text-base leading-snug" style={{ color: 'var(--text-muted)' }}>
                {quip}
            </p>
        </div>
    );
}
