"use client";

import React, { useMemo } from 'react';
import { useStore } from '../../lib/store';
import { isSameDay, format } from 'date-fns';
import { PRIORITY_ORDER } from '../../lib/constants';
import { ItemRow } from '../shared/ItemRow';
import { AnimatePresence, motion } from 'framer-motion';
import { caveat } from '../../lib/fonts';
import { cn } from '../../lib/utils';

type Item = any;

const prefersReducedMotion = () => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

export function DayDetailList() {
    const items = useStore((state: any) => state.items);
    const selectedDate = useStore((state: any) => state.selectedDate);

    // Filter and sort items to perfectly match what the calendar strip shows, but richer
    const dayItems = useMemo(() => {
        if (!selectedDate) return [];
        
        const filtered = items.filter((item: Item) => isSameDay(new Date(item.date), selectedDate));
        
        return filtered.sort((a: Item, b: Item) => {
            // Completed items always jump to the bottom
            if (a.completedAt && !b.completedAt) return 1;
            if (!a.completedAt && b.completedAt) return -1;

            // Sort by Priority: Critical -> Important -> Routine
            const pA = PRIORITY_ORDER[a.priority as keyof typeof PRIORITY_ORDER] || 99;
            const pB = PRIORITY_ORDER[b.priority as keyof typeof PRIORITY_ORDER] || 99;
            if (pA !== pB) return pA - pB;

            // Then by Start Time
            const tA = a.startTime ? new Date(a.startTime).getTime() : Number.MAX_SAFE_INTEGER;
            const tB = b.startTime ? new Date(b.startTime).getTime() : Number.MAX_SAFE_INTEGER;
            return tA - tB;
        });
    }, [items, selectedDate]);

    // Handle initial state if still mounting
    if (!selectedDate) return null;

    return (
        <div className="flex flex-col gap-4 mt-2">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--border)] px-1">
                <h2 className="text-lg font-medium text-[var(--text-primary)]">
                    {isSameDay(selectedDate, new Date()) ? 'Today' : format(selectedDate, 'EEEE, MMMM do')}
                </h2>
                <div className="text-sm text-[var(--text-muted)] font-mono bg-[var(--bg-surface)] px-2 py-0.5 rounded-md">
                    {dayItems.length} {dayItems.length === 1 ? 'item' : 'items'}
                </div>
            </div>

            <div className="flex flex-col gap-3 min-h-[150px]">
                {dayItems.length > 0 ? (
                    <AnimatePresence mode="popLayout">
                        {dayItems.map((item: Item) => (
                            <ItemRow key={item.id} item={item} />
                        ))}
                    </AnimatePresence>
                ) : (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center justify-center p-8 text-center text-[var(--text-muted)] h-full"
                    >
                        <p className={cn(caveat.variable, "font-caveat text-2xl -rotate-2")}>
                            Nothing going on this day!
                        </p>
                        <p className="text-sm mt-2 opacity-75">
                            Tap the + button to add something.
                        </p>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
