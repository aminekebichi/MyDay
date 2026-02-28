"use client";

// Implements #6: scrollable weekly calendar strip
import React from "react";
import {
    format,
    startOfWeek,
    addDays,
    isSameDay,
    isPast,
    isToday
} from "date-fns";
import { useItems } from "@/hooks/useItems";
import { CATEGORY_COLORS, PRIORITY_LEVELS } from "@/lib/constants";
import { cn } from "@/lib/utils"; // I'll create this helper if missing

interface CalendarStripProps {
    onDaySelect?: (date: Date) => void;
}

export function CalendarStrip({ onDaySelect }: CalendarStripProps) {
    const { items, isLoading } = useItems();

    // Get Mon-Sun of current week
    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Monday
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

    const getItemColor = (type: string) => {
        return CATEGORY_COLORS[type.toLowerCase()] || "var(--accent-blue)";
    };

    const getDayItems = (date: Date) => {
        if (!items) return [];

        const itemsArray = Array.isArray(items) ? items : Object.values(items).flat() as any[];

        return itemsArray
            .filter((item: any) => isSameDay(new Date(item.date), date))
            .sort((a, b) => {
                const priorityA = PRIORITY_LEVELS[a.priority as keyof typeof PRIORITY_LEVELS] || 0;
                const priorityB = PRIORITY_LEVELS[b.priority as keyof typeof PRIORITY_LEVELS] || 0;
                return priorityB - priorityA;
            });
    };

    return (
        <nav
            aria-label="Weekly calendar"
            className="w-full overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide"
        >
            <div className="flex gap-4 min-w-max py-4">
                {weekDays.map((day) => {
                    const dayItems = getDayItems(day);
                    const isDayToday = isToday(day);
                    const isDayPast = isPast(day) && !isDayToday;
                    const displayItems = dayItems.slice(0, 3);
                    const overflowCount = dayItems.length > 3 ? dayItems.length - 3 : 0;

                    return (
                        <button
                            key={day.toISOString()}
                            onClick={() => onDaySelect?.(day)}
                            aria-label={`${format(day, "EEEE, MMMM d")} — ${dayItems.length} items`}
                            className={cn(
                                "flex flex-col gap-3 p-3 rounded-2xl transition-all duration-300 min-h-[160px] text-left border border-transparent",
                                isDayToday ? "today-elevation w-40" : "bg-elevated w-32",
                                isDayPast && "hatch-pattern opacity-60"
                            )}
                        >
                            <div className="flex flex-col">
                                <span className={cn(
                                    "text-xs font-mono font-medium uppercase tracking-wider",
                                    isDayToday ? "text-foreground" : "text-muted"
                                )}>
                                    {format(day, "eee")}
                                </span>
                                <span className={cn(
                                    "text-xl font-mono font-bold",
                                    isDayToday ? "text-primary" : "text-foreground"
                                )}>
                                    {format(day, "d")}
                                </span>
                            </div>

                            <div className="flex flex-col gap-1.5 flex-grow">
                                {displayItems.map((item: any) => (
                                    <div
                                        key={item.id}
                                        className="flex items-center gap-2 pl-2 border-l-2 py-0.5"
                                        style={{ borderLeftColor: getItemColor(item.type) }}
                                    >
                                        <span className="text-[10px] font-mono leading-tight truncate">
                                            {item.title}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {overflowCount > 0 && (
                                <div className="mt-auto self-start px-2 py-1 rounded-full bg-background border border-border-primary text-[10px] font-mono text-muted">
                                    +{overflowCount} more
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>
        </nav>
    );
}

// cn utility moved to @/lib/utils
