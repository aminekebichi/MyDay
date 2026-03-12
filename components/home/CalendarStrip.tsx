"use client";

import React, { useMemo, useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react';
import { useStore } from '../../lib/store';
import { useWeekItems } from '../../hooks/useWeekItems';
import { startOfWeek, endOfWeek, eachDayOfInterval, format, isSameDay, isBefore, startOfDay, addWeeks, subWeeks } from 'date-fns';
import { CATEGORY_COLORS, PRIORITY_ORDER } from '../../lib/constants';
import { cn } from '../../lib/utils';
import { geistMono } from '../../lib/fonts';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar } from 'lucide-react';

type Item = any;

const prefersReducedMotion = () => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

const WeekChunk = React.memo(({ weekStartDt, today }: { weekStartDt: Date, today: Date }) => {
    // Fetch data and populate store transparently for THIS week
    useWeekItems(weekStartDt);
    const items = useStore((state: any) => state.items);
    const selectedDate = useStore((state: any) => state.selectedDate);
    const setSelectedDate = useStore((state: any) => state.setSelectedDate);

    const weekDays = useMemo(() => {
        const start = startOfWeek(weekStartDt, { weekStartsOn: 1 });
        const end = endOfWeek(weekStartDt, { weekStartsOn: 1 });
        return eachDayOfInterval({ start, end });
    }, [weekStartDt]);

    const getItemsForDay = useCallback((day: Date) => {
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
    }, [items]);

    const handleDayClick = (day: Date) => {
        setSelectedDate(day);
    };

    return (
        <React.Fragment>
            {weekDays.map((day) => {
                const isToday = isSameDay(day, today);
                const isPast = isBefore(day, today) && !isToday;
                const dayItems = getItemsForDay(day);
                const displayItems = dayItems.slice(0, 3);
                const overflowCount = dayItems.length > 3 ? dayItems.length - 3 : 0;

                const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;

                return (
                    <button
                        key={day.toISOString()}
                        onClick={() => handleDayClick(day)}
                        aria-label={`${format(day, 'EEEE, MMMM do')} — ${dayItems.length} items`}
                        className={cn(
                            "flex flex-col flex-none w-[120px] rounded-xl p-3 text-left transition-all snap-start",
                            "border border-[length:var(--border)]",
                            isToday && !isSelected && "bg-[var(--bg-elevated)] shadow-sm border-[var(--accent)]",
                            isSelected && "bg-[var(--accent)] text-white shadow-md border-[var(--accent)] scale-[1.02]",
                            !isToday && !isSelected && "bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)]",
                            isPast && !isSelected && "opacity-75 hatch-pattern",
                            "min-h-[44px]" // Accessibility minimum touch target height
                        )}
                        style={{
                            borderColor: isToday || isSelected ? 'var(--accent)' : 'var(--border)'
                        }}
                    >
                        <div className="flex flex-col mb-3">
                            <span className={cn(
                                "text-xs uppercase tracking-wider",
                                isToday && !isSelected ? "text-[var(--accent)] font-bold" : "",
                                isSelected ? "text-white opacity-90 font-medium" : "text-[var(--text-muted)]"
                            )}>
                                {format(day, 'EEE')}
                            </span>
                            <span className={cn(
                                "text-2xl font-light",
                                isSelected ? "text-white" : "text-[var(--text-primary)]"
                            )}>
                                {format(day, 'd')}
                            </span>
                        </div>

                        <div className="flex flex-col gap-1.5 flex-1 w-full mt-auto">
                            {displayItems.length > 0 ? (
                                displayItems.map((item: Item) => {
                                    const categoryColor = CATEGORY_COLORS[item.type as keyof typeof CATEGORY_COLORS] || CATEGORY_COLORS.TASK;
                                    // Default to dark color palette for MVP stripes
                                    const stripeColor = categoryColor.dark;

                                    return (
                                        <div
                                            key={item.id}
                                            className="text-[11px] truncate w-full pl-2 relative flex items-center h-4"
                                            style={{ color: isSelected ? 'currentColor' : 'var(--text-primary)' }}
                                        >
                                            {/* Left border stripe */}
                                            <div
                                                className="absolute left-0 top-0 bottom-0 w-1 rounded-full"
                                                style={{ backgroundColor: isSelected ? 'rgba(255,255,255,0.5)' : stripeColor }}
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
                                        backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : 'var(--bg-elevated)',
                                        color: isSelected ? 'white' : 'var(--text-muted)'
                                    }}
                                >
                                    +{overflowCount} more
                                </div>
                            )}
                        </div>
                    </button>
                );
            })}
        </React.Fragment>
    );
});
WeekChunk.displayName = 'WeekChunk';

export function CalendarStrip() {
    const today = useMemo(() => startOfDay(new Date()), []);
    const initialWeekStart = useMemo(() => startOfWeek(today, { weekStartsOn: 1 }), [today]);

    const [weeks, setWeeks] = useState<number[]>([initialWeekStart.getTime()]);
    const scrollContainerRef = useRef<HTMLElement>(null);
    const previousScrollWidth = useRef<number>(0);
    const observerRef = useRef<IntersectionObserver | null>(null);

    // Infinite scroll intersection handlers
    const loadMorePrev = useCallback(() => {
        setWeeks(prev => {
            const firstWeek = new Date(prev[0]);
            return [subWeeks(firstWeek, 1).getTime(), ...prev];
        });
    }, []);

    const loadMoreNext = useCallback(() => {
        setWeeks(prev => {
            const lastWeek = new Date(prev[prev.length - 1]);
            return [...prev, addWeeks(lastWeek, 1).getTime()];
        });
    }, []);

    const leftSentinelRef = useRef<HTMLDivElement>(null);
    const rightSentinelRef = useRef<HTMLDivElement>(null);

    // Maintain IntersectionObserver
    useEffect(() => {
        const options = {
            root: scrollContainerRef.current,
            rootMargin: '150px', // Fetch chunks slightly before they enter viewport
            threshold: 0
        };

        const callback = (entries: IntersectionObserverEntry[]) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    if (entry.target === leftSentinelRef.current) loadMorePrev();
                    if (entry.target === rightSentinelRef.current) loadMoreNext();
                }
            });
        };

        observerRef.current = new IntersectionObserver(callback, options);

        if (leftSentinelRef.current) observerRef.current.observe(leftSentinelRef.current);
        if (rightSentinelRef.current) observerRef.current.observe(rightSentinelRef.current);

        return () => observerRef.current?.disconnect();
    }, [loadMorePrev, loadMoreNext]);

    // Handle smooth snap back to scroll position after prepending items to the DOM
    useLayoutEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return;
        
        const currentScrollWidth = container.scrollWidth;
        // If scrollWidth increased heavily but scrollLeft is near left edge, we likely prepended
        if (previousScrollWidth.current > 0 && currentScrollWidth > previousScrollWidth.current) {
            const diff = currentScrollWidth - previousScrollWidth.current;
            if (container.scrollLeft < 200) {
                container.scrollLeft += diff;
            }
        }
        previousScrollWidth.current = currentScrollWidth;
    }, [weeks]);

    // Jump to Today visibility logic
    const [showJumpToToday, setShowJumpToToday] = useState(false);

    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const handleScroll = () => {
             // By checking if weeks array drifted significantly (more than 2 full loaded chunks)
             // Or calculating if center of scroll view is far from today's center
             // A very simple heuristic: if we fetched several weeks, today is probably off screen
             if (weeks.length >= 3) {
                 setShowJumpToToday(true);
             } else {
                 setShowJumpToToday(false);
             }
        };

        container.addEventListener('scroll', handleScroll, { passive: true });
        return () => container.removeEventListener('scroll', handleScroll);
    }, [weeks]);

    // Animate smoothly back to today
    const handleJumpToToday = useCallback(() => {
        // Reset the loaded weeks to just the initial week (garbage collecting the far away DOM nodes)
        setWeeks([initialWeekStart.getTime()]);
        
        if (scrollContainerRef.current) {
            scrollContainerRef.current.style.scrollBehavior = 'smooth';
            scrollContainerRef.current.scrollLeft = 0;
            // Native smooth scroll transition
            if (prefersReducedMotion()) {
                 scrollContainerRef.current.style.scrollBehavior = 'auto';
            }
        }
        setShowJumpToToday(false);
    }, [initialWeekStart]);

    return (
        <div className="relative w-full">
            <nav
                ref={scrollContainerRef}
                aria-label="Weekly calendar"
                className={cn(
                    "flex overflow-x-auto gap-3 px-4 py-4 pb-6 snap-x snap-mandatory relative",
                    geistMono.variable,
                    "font-mono"
                )}
            >
                <div ref={leftSentinelRef} className="w-1 flex-shrink-0 opacity-0" aria-hidden="true" />
                
                {weeks.map((weekTimestamp) => (
                    <React.Fragment key={weekTimestamp}>
                        <WeekChunk weekStartDt={new Date(weekTimestamp)} today={today} />
                    </React.Fragment>
                ))}
                
                <div ref={rightSentinelRef} className="w-1 flex-shrink-0 opacity-0" aria-hidden="true" />
            </nav>

            <AnimatePresence>
                {showJumpToToday && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.9, y: 15 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 15 }}
                        transition={{ duration: 0.2 }}
                        onClick={handleJumpToToday}
                        className={cn(
                            "absolute bottom-0 left-1/2 -translate-x-1/2 -translate-y-2",
                            "flex items-center gap-2 bg-[var(--accent)] text-white px-4 py-1.5 rounded-full shadow-lg text-sm font-medium",
                            "hover:opacity-90 active:scale-95 transition-all z-10"
                        )}
                        aria-label="Jump to Today"
                    >
                        <Calendar size={14} />
                        Jump to Today
                    </motion.button>
                )}
            </AnimatePresence>
        </div>
    );
}
