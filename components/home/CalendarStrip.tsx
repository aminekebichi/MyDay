"use client";

import React, { useMemo } from 'react';
import { useStore } from '../../lib/store';
// Force Turbopack to rescan dependencies
import { useWeekItems } from '../../hooks/useWeekItems';
import { startOfWeek, endOfWeek, eachDayOfInterval, format, isSameDay, isBefore, startOfDay } from 'date-fns';
import { CATEGORY_COLORS, PRIORITY_ORDER } from '../../lib/constants';
import { cn } from '../../lib/utils';
import { geistMono } from '../../lib/fonts';

// To avoid TS errors since Prisma generated types might not be ready yet
type Item = any;

export function CalendarStrip() {
    const today = startOfDay(new Date());
    const weekStart = startOfWeek(today, { weekStartsOn: 1 });

    // Fetch data and populate store transparently
    useWeekItems(weekStart);

    const items = useStore((state: any) => state.items);

    // Calculate the days of the current week (Monday-Sunday)
    const weekDays = useMemo(() => {
        const start = startOfWeek(today, { weekStartsOn: 1 }); // 1 = Monday
        const end = endOfWeek(today, { weekStartsOn: 1 });
        return eachDayOfInterval({ start, end });
    }, [today]);

    const getItemsForDay = (day: Date) => {
        const dayItems = items.filter((item: Item) => isSameDay(new Date(item.date), day));
        // Sort by Priority: Critical -> Important -> Routine, then by Start Time
        return dayItems.sort((a: Item, b: Item) => {
            const pA = PRIORITY_ORDER[a.priority as keyof typeof PRIORITY_ORDER] || 99;
            const pB = PRIORITY_ORDER[b.priority as keyof typeof PRIORITY_ORDER] || 99;
            if (pA !== pB) return pA - pB;

            const tA = a.startTime ? new Date(a.startTime).getTime() : Number.MAX_SAFE_INTEGER;
            const tB = b.startTime ? new Date(b.startTime).getTime() : Number.MAX_SAFE_INTEGER;
            return tA - tB;
        });
    };

    const handleDayClick = (day: Date) => {
        // Implements #12: DayDetailSheet open handler
        // TODO: Actually open the sheet when it's built
        console.log("Opening sheet for", format(day, "yyyy-MM-dd"));
    };

    return (
        <nav
            aria-label="Weekly calendar"
            className={cn(
                "flex overflow-x-auto gap-3 px-4 py-4 snap-x snap-mandatory hide-scrollbar",
                geistMono.variable,
                "font-mono"
            )}
            style={{ scrollBehavior: 'smooth' }}
        >
            {weekDays.map((day) => {
                const isToday = isSameDay(day, today);
                const isPast = isBefore(day, today) && !isToday;
                const dayItems = getItemsForDay(day);
                const displayItems = dayItems.slice(0, 3);
                const overflowCount = dayItems.length > 3 ? dayItems.length - 3 : 0;

                return (
                    <button
                        key={day.toISOString()}
                        onClick={() => handleDayClick(day)}
                        aria-label={`${format(day, 'EEEE, MMMM do')} — ${dayItems.length} items`}
                        className={cn(
                            "flex flex-col flex-none w-[120px] rounded-xl p-3 text-left transition-all snap-start",
                            "border border-[length:var(--border)]",
                            isToday ? "bg-[var(--bg-elevated)] min-w-[140px] shadow-sm border-[var(--accent)]" : "bg-[var(--bg-surface)]",
                            isPast && "opacity-75 hatch-pattern",
                            "min-h-[44px]" // Accessibility minimum touch target height
                        )}
                        style={{
                            borderColor: isToday ? 'var(--accent)' : 'var(--border)'
                        }}
                    >
                        <div className="flex flex-col mb-3">
                            <span className={cn(
                                "text-xs uppercase tracking-wider",
                                isToday ? "text-[var(--accent)] font-bold" : "text-[var(--text-muted)]"
                            )}>
                                {format(day, 'EEE')}
                            </span>
                            <span className={cn(
                                "text-2xl font-light",
                                isToday ? "text-[var(--text-primary)]" : "text-[var(--text-primary)]"
                            )}>
                                {format(day, 'd')}
                            </span>
                        </div>

                        <div className="flex flex-col gap-1.5 flex-1 w-full mt-auto">
                            {displayItems.length > 0 ? (
                                displayItems.map((item: Item) => {
                                    const categoryColor = CATEGORY_COLORS[item.type as keyof typeof CATEGORY_COLORS] || CATEGORY_COLORS.TASK;
                                    // Theme detection in CSS variables handles light/dark mapping automatically for our custom tokens, 
                                    // but since JS objects hold the raw hexes here, we'll gracefully default to dark mode colors.
                                    // Real implementation might read actual theme or inject style object.
                                    const stripeColor = categoryColor.dark;

                                    return (
                                        <div
                                            key={item.id}
                                            className="text-[11px] truncate w-full pl-2 relative flex items-center h-4"
                                            style={{ color: 'var(--text-primary)' }}
                                        >
                                            {/* Left border stripe */}
                                            <div
                                                className="absolute left-0 top-0 bottom-0 w-1 rounded-full"
                                                style={{ backgroundColor: stripeColor }}
                                            />
                                            <span className="truncate">{item.title}</span>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="text-[11px] text-[var(--text-muted)] italic pl-2 pt-1 h-4">
                                    No items
                                </div>
                            )}

                            {overflowCount > 0 && (
                                <div
                                    className="mt-1 self-start inline-flex items-center px-1.5 py-0.5 rounded text-[10px]"
                                    style={{
                                        backgroundColor: 'var(--bg-elevated)',
                                        color: 'var(--text-muted)'
                                    }}
                                >
                                    +{overflowCount} more
                                </div>
                            )}
                        </div>
                    </button>
                );
            })}
        </nav>
    );
}
