"use client";

import React, { useMemo, useRef, useState, useEffect } from 'react';
import { useStore } from '../../lib/store';
import { useWeekItems } from '../../hooks/useWeekItems';
import { startOfWeek, format, isSameDay, isBefore, startOfDay, addDays, getMonth, getYear } from 'date-fns';
import { CATEGORY_COLORS, PRIORITY_ORDER } from '../../lib/constants';
import { cn } from '../../lib/utils';
import { geistMono } from '../../lib/fonts';

type Item = any;

const LOOKAHEAD_DAYS = 365 * 2;
const CARD_GAP = 12;           // gap-3
const MARKER_WIDTH = 28;       // width of each inline year/month marker element
const NAV_RIGHT_PAD = 16;      // px-4 right padding

// Fixed overlay geometry — sized to the actual rendered text, not a fraction of cardWidth.
// OVERLAY_WIDTH : total overlay width (content + gradient fade zone)
// OVERLAY_OPAQUE: x at which gradient is fully opaque; markers crossing this → label update
// Nav left padding is set to OVERLAY_WIDTH so the first day card always starts beyond the overlay.
const OVERLAY_WIDTH = 70;
const OVERLAY_OPAQUE = 54;

type CalendarEntry =
    | { kind: 'month'; label: string; isoMonth: string }
    | { kind: 'year'; label: string }
    | { kind: 'day'; date: Date };

export function CalendarStrip() {
    const today = startOfDay(new Date());
    const weekStart = startOfWeek(today, { weekStartsOn: 1 });
    const navRef = useRef<HTMLElement>(null);
    const [cardWidth, setCardWidth] = useState(100);
    const [isScrolled, setIsScrolled] = useState(false);
    const [activeMonth, setActiveMonth] = useState(() => format(today, 'MMMM'));
    const [activeYear, setActiveYear] = useState(() => format(today, 'yyyy'));

    useWeekItems(weekStart);

    const items = useStore((state: any) => state.items);
    const selectedDate = useStore((state: any) => state.selectedDate);
    const setSelectedDate = useStore((state: any) => state.setSelectedDate);

    // Recalculate card width so the initial visible days exactly fill the strip
    useEffect(() => {
        const calculate = () => {
            if (!navRef.current) return;
            const available = navRef.current.clientWidth - OVERLAY_WIDTH - NAV_RIGHT_PAD;
            const isLarge = window.innerWidth >= 1024;
            const targetWidth = isLarge ? 300 : 150;
            const count = Math.max(3, Math.floor((available + CARD_GAP) / (targetWidth + CARD_GAP)));
            const width = (available - CARD_GAP * (count - 1)) / count;
            setCardWidth(Math.min(200, Math.max(targetWidth * 0.7, width)));
        };
        calculate();
        const observer = new ResizeObserver(calculate);
        if (navRef.current) observer.observe(navRef.current);
        return () => observer.disconnect();
    }, []);

    // Pre-index items by date string for O(1) lookup across 730 rendered days
    const itemsByDate = useMemo(() => {
        const map = new Map<string, Item[]>();
        items.forEach((item: Item) => {
            const key = format(startOfDay(new Date(item.date)), 'yyyy-MM-dd');
            if (!map.has(key)) map.set(key, []);
            map.get(key)!.push(item);
        });
        return map;
    }, [items]);

    // Build the flat entry list: today → LOOKAHEAD_DAYS, with month + year markers inserted.
    // The first year and first month markers are skipped — the fixed overlay already shows them.
    const entries = useMemo((): CalendarEntry[] => {
        const result: CalendarEntry[] = [];
        let prevMonth = -1;
        let prevYear = -1;
        let firstYear = true;
        let firstMonth = true;
        for (let i = 0; i < LOOKAHEAD_DAYS; i++) {
            const day = addDays(today, i);
            const month = getMonth(day);
            const year = getYear(day);
            if (year !== prevYear) {
                if (!firstYear) result.push({ kind: 'year', label: format(day, 'yyyy') });
                firstYear = false;
                prevYear = year;
            }
            if (month !== prevMonth) {
                if (!firstMonth) result.push({ kind: 'month', label: format(day, 'MMMM'), isoMonth: format(day, 'yyyy-MM') });
                firstMonth = false;
                prevMonth = month;
            }
            result.push({ kind: 'day', date: day });
        }
        return result;
    }, [today]);

    // Precompute the scroll-space x-offset of every month and year marker.
    // These are stable unless cardWidth changes (which also changes entries' cumulative widths).
    const markerPositions = useMemo(() => {
        const months: Array<{ label: string; offset: number }> = [];
        const years: Array<{ label: string; offset: number }> = [];
        let x = OVERLAY_WIDTH; // nav left padding equals overlay width
        for (const entry of entries) {
            if (entry.kind === 'year') {
                years.push({ label: entry.label, offset: x });
                x += MARKER_WIDTH + CARD_GAP;
            } else if (entry.kind === 'month') {
                months.push({ label: entry.label, offset: x });
                x += MARKER_WIDTH + CARD_GAP;
            } else {
                x += cardWidth + CARD_GAP;
            }
        }
        return { months, years };
    }, [entries, cardWidth]);

    // Derive active month/year from scroll position + marker offsets.
    // Active = the last marker whose left edge has crossed the opaque zone (one card-width from left).
    const computeActiveLabels = (scrollLeft: number) => {
        const threshold = scrollLeft + OVERLAY_OPAQUE;

        let newMonth = format(today, 'MMMM');
        for (const { label, offset } of markerPositions.months) {
            if (offset <= threshold) newMonth = label;
            else break;
        }

        let newYear = format(today, 'yyyy');
        for (const { label, offset } of markerPositions.years) {
            if (offset <= threshold) newYear = label;
            else break;
        }

        setActiveMonth(prev => prev !== newMonth ? newMonth : prev);
        setActiveYear(prev => prev !== newYear ? newYear : prev);
    };

    const getSortedItemsForDay = (day: Date): Item[] => {
        const key = format(day, 'yyyy-MM-dd');
        const dayItems = [...(itemsByDate.get(key) ?? [])];
        return dayItems.sort((a, b) => {
            const pA = PRIORITY_ORDER[a.priority as keyof typeof PRIORITY_ORDER] ?? 99;
            const pB = PRIORITY_ORDER[b.priority as keyof typeof PRIORITY_ORDER] ?? 99;
            if (pA !== pB) return pA - pB;
            const tA = a.startTime ? new Date(a.startTime).getTime() : Number.MAX_SAFE_INTEGER;
            const tB = b.startTime ? new Date(b.startTime).getTime() : Number.MAX_SAFE_INTEGER;
            return tA - tB;
        });
    };

    // Re-sync labels whenever marker positions change (e.g. after a resize)
    useEffect(() => {
        if (!navRef.current) return;
        computeActiveLabels(navRef.current.scrollLeft);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [markerPositions]);

    const handleWheel = (e: React.WheelEvent<HTMLElement>) => {
        if (navRef.current) {
            e.preventDefault();
            navRef.current.scrollLeft += e.deltaY;
        }
    };

    const handleScroll = () => {
        if (!navRef.current) return;
        const scrollLeft = navRef.current.scrollLeft;
        setIsScrolled(scrollLeft > cardWidth);
        computeActiveLabels(scrollLeft);
    };

    const scrollToToday = () => {
        navRef.current?.scrollTo({ left: 0, behavior: 'smooth' });
        setSelectedDate(today);
    };

    return (
        <div className="relative">
            <nav
                ref={navRef}
                aria-label="Calendar"
                onWheel={handleWheel}
                onScroll={handleScroll}
                className={cn(
                    "flex overflow-x-auto gap-3 py-4 hide-scrollbar",
                    geistMono.variable,
                    "font-mono"
                )}
                style={{ scrollBehavior: 'smooth', paddingLeft: OVERLAY_WIDTH, paddingRight: NAV_RIGHT_PAD }}
            >
                {entries.map((entry) => {
                    if (entry.kind === 'year') {
                        return (
                            <div
                                key={`year-${entry.label}`}
                                className="flex-none flex items-center justify-center border-l-2"
                                style={{
                                    width: MARKER_WIDTH,
                                    minHeight: 44,
                                    borderColor: 'var(--text-muted)',
                                }}
                            >
                                <span
                                    className="text-[14px] uppercase tracking-widest font-bold select-none"
                                    style={{ color: 'var(--text-muted)', writingMode: 'vertical-lr' }}
                                >
                                    {entry.label}
                                </span>
                            </div>
                        );
                    }

                    if (entry.kind === 'month') {
                        return (
                            <div
                                key={`month-${entry.isoMonth}`}
                                className="flex-none flex items-center justify-center border-l-2"
                                style={{
                                    width: MARKER_WIDTH,
                                    minHeight: 44,
                                    borderColor: 'var(--accent)',
                                }}
                            >
                                <span
                                    className="text-[14px] uppercase tracking-widest font-bold select-none"
                                    style={{ color: 'var(--accent)', writingMode: 'vertical-lr' }}
                                >
                                    {entry.label}
                                </span>
                            </div>
                        );
                    }

                    const { date: day } = entry;
                    const isToday = isSameDay(day, today);
                    const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
                    const isPast = isBefore(day, today) && !isToday;
                    const dayItems = getSortedItemsForDay(day);
                    const displayItems = dayItems.slice(0, 3);
                    const overflowCount = dayItems.length > 3 ? dayItems.length - 3 : 0;

                    return (
                        <button
                            key={day.toISOString()}
                            onClick={() => setSelectedDate(startOfDay(day))}
                            aria-label={`${format(day, 'EEEE, MMMM do')} — ${dayItems.length} items`}
                            aria-pressed={isSelected}
                            className={cn(
                                "flex-none flex flex-col rounded-xl p-3 text-left transition-all",
                                "border min-h-[44px]",
                                isSelected ? "bg-[var(--bg-elevated)] shadow-sm" : "bg-[var(--bg-surface)]",
                                isPast && "opacity-60 hatch-pattern",
                            )}
                            style={{
                                width: cardWidth,
                                borderColor: isSelected ? 'var(--accent)' : 'var(--border)',
                            }}
                        >
                            <div className="flex flex-col mb-2">
                                <span className={cn(
                                    "text-xs uppercase tracking-wider truncate",
                                    isToday ? "text-[var(--accent)] font-bold" : "text-[var(--text-muted)]"
                                )}>
                                    {format(day, 'EEE')}
                                </span>
                                <span className="text-2xl font-light" style={{ color: 'var(--text-primary)' }}>
                                    {format(day, 'd')}
                                </span>
                            </div>

                            <div className="flex flex-col gap-1.5 w-full">
                                {displayItems.length > 0 ? (
                                    displayItems.map((item: Item) => {
                                        const color = (CATEGORY_COLORS[item.type as keyof typeof CATEGORY_COLORS] ?? CATEGORY_COLORS.TASK).dark;
                                        return (
                                            <div
                                                key={item.id}
                                                className="text-[11px] truncate w-full pl-2 relative flex items-center h-4"
                                                style={{ color: 'var(--text-primary)' }}
                                            >
                                                <div
                                                    className="absolute left-0 top-0 bottom-0 w-1 rounded-full"
                                                    style={{ backgroundColor: color }}
                                                />
                                                <span className="truncate">{item.title}</span>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="text-[11px] italic pl-2 h-4" style={{ color: 'var(--text-muted)' }}>
                                        —
                                    </div>
                                )}
                                {overflowCount > 0 && (
                                    <div
                                        className="mt-0.5 self-start inline-flex items-center px-1.5 py-0.5 rounded text-[10px]"
                                        style={{ backgroundColor: 'var(--bg-elevated)', color: 'var(--text-muted)' }}
                                    >
                                        +{overflowCount} more
                                    </div>
                                )}
                            </div>
                        </button>
                    );
                })}
            </nav>

            {/* ── Fixed month/year platform ───────────────────────────────────────────
                Width = OVERLAY_WIDTH. Gradient: opaque up to OVERLAY_OPAQUE, then fades.
                Styled to match the inline scroll markers: vertical text, border-l-2 accents.
                Month fills the top space; year sits at the bottom. */}
            <div
                className="absolute left-0 top-0 bottom-0 z-10 pointer-events-none flex"
                style={{ width: OVERLAY_WIDTH }}
            >
                {/* Gradient background */}
                <div
                    className="absolute inset-0"
                    style={{
                        background: `linear-gradient(to right, var(--bg-base) ${OVERLAY_OPAQUE}px, transparent ${OVERLAY_WIDTH}px)`,
                    }}
                />
                {/* Label columns — vertical text, matches inline marker styling */}
                <div className="relative z-10 flex flex-col h-full pl-3 py-4 gap-1.5">
                    {/* Month — top, takes remaining space */}
                    <div className="border-l-2 pl-1.5 flex-1" style={{ borderColor: 'var(--accent)' }}>
                        <span
                            key={`fm-${activeMonth}`}
                            className="calendar-label-enter text-[14px] uppercase tracking-widest font-bold select-none"
                            style={{ color: 'var(--accent)', writingMode: 'vertical-lr' }}
                        >
                            {activeMonth}
                        </span>
                    </div>
                    {/* Year — bottom */}
                    <div className="border-l-2 pl-1.5" style={{ borderColor: 'var(--text-muted)' }}>
                        <span
                            key={`fy-${activeYear}`}
                            className="calendar-label-enter text-[9px] uppercase tracking-widest font-bold select-none"
                            style={{ color: 'var(--text-muted)', writingMode: 'vertical-lr' }}
                        >
                            {activeYear}
                        </span>
                    </div>
                </div>
            </div>

            {/* Back-to-today pill — fades in once the user scrolls past the first card */}
            <button
                onClick={scrollToToday}
                aria-label="Scroll back to today"
                tabIndex={isScrolled ? 0 : -1}
                className={cn(
                    "absolute right-4 top-1/2 -translate-y-1/2",
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono shadow-md",
                    "transition-all duration-200",
                    isScrolled ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                )}
                style={{
                    backgroundColor: 'var(--bg-elevated)',
                    color: 'var(--accent)',
                    border: '1px solid var(--accent)',
                    zIndex: 10,
                }}
            >
                ← Today
            </button>
        </div>
    );
}

