"use client";

import React, { useState } from 'react';
import { CATEGORY_COLORS, PRIORITY_COLORS } from '../../lib/constants';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, MapPin, Clock } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useStore } from '../../lib/store';

type Item = any;

const prefersReducedMotion = () => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

export function ItemRow({ item }: { item: Item }) {
    const updateItem = useStore((state: any) => state.updateItem);
    const [isUpdating, setIsUpdating] = useState(false);

    // Provide default dark theme colors since CSS vars handle light/dark bg tinting
    const categoryColor = CATEGORY_COLORS[item.type as keyof typeof CATEGORY_COLORS]?.dark || CATEGORY_COLORS.TASK.dark;
    const priorityColor = PRIORITY_COLORS[item.priority as keyof typeof PRIORITY_COLORS];
    
    const isCompleted = !!item.completedAt;

    const handleToggleComplete = async () => {
        if (item.type !== 'TASK' && item.type !== 'ASSIGNMENT') return;
        if (isUpdating) return;
        
        setIsUpdating(true);
        const newCompletedAt = isCompleted ? null : new Date().toISOString();
        
        // Optimistic UI update
        updateItem(item.id, { completedAt: newCompletedAt });

        try {
            const res = await fetch(`/api/items/${item.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Session-Token': 'usr_test_123'
                },
                body: JSON.stringify({
                    completedAt: newCompletedAt
                })
            });

            if (!res.ok) {
                // Rollback on failure
                updateItem(item.id, { completedAt: item.completedAt });
                console.error("Failed to update item status");
            }
        } catch (error) {
            updateItem(item.id, { completedAt: item.completedAt });
            console.error(error);
        } finally {
            setIsUpdating(false);
        }
    };

    const formatTime = (timeStr: string | null) => {
        if (!timeStr) return null;
        return format(new Date(timeStr), 'h:mm a');
    };

    const hasTimeInfo = item.startTime || item.endTime;
    const isChecksAllowed = item.type === 'TASK' || item.type === 'ASSIGNMENT';

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: isCompleted ? 0.6 : 1, y: 0 }}
            transition={{ duration: prefersReducedMotion() ? 0 : 0.2 }}
            className={cn(
                "relative flex flex-col gap-2 p-3 pl-4 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] overflow-hidden",
                "transition-colors"
            )}
        >
            {/* Category Left Border Stripe */}
            <div 
                className="absolute left-0 top-0 bottom-0 w-1.5"
                style={{ backgroundColor: categoryColor }}
            />
            
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                    
                    {/* Checkbox for Tasks */}
                    {isChecksAllowed && (
                        <button
                            onClick={handleToggleComplete}
                            disabled={isUpdating}
                            aria-label={isCompleted ? "Mark incomplete" : "Mark complete"}
                            className={cn(
                                "flex-shrink-0 mt-0.5 w-5 h-5 rounded-full border border-[var(--border)] flex items-center justify-center transition-all",
                                isCompleted ? "bg-[var(--accent)] border-[var(--accent)] text-white" : "bg-transparent hover:border-[var(--text-muted)]"
                            )}
                        >
                            <AnimatePresence>
                                {isCompleted && (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        exit={{ scale: 0 }}
                                        transition={{ duration: 0.15 }}
                                    >
                                        <Check size={12} strokeWidth={3} />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </button>
                    )}

                    {/* Title */}
                    <div className="flex flex-col min-w-0">
                        <span className={cn(
                            "font-medium text-[var(--text-primary)] relative break-words",
                            isCompleted && "text-[var(--text-muted)]"
                        )}>
                            {item.title}
                            
                            {/* Strikethrough Animation Layer */}
                            {isCompleted && (
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: "100%" }}
                                    transition={{ duration: 0.2 }}
                                    className="absolute left-0 top-1/2 h-[1.5px] bg-[var(--text-muted)] origin-left -translate-y-1/2"
                                />
                            )}
                        </span>
                        
                        {/* Location / Meeting Line */}
                        {item.location && (
                             <div className="flex items-center gap-1.5 mt-1 text-xs text-[var(--text-muted)]">
                                 <MapPin size={12} />
                                 <span className="truncate">{item.location}</span>
                             </div>
                        )}
                        {item.type === 'MEETING' && item.attendeeName && (
                            <div className="text-xs text-[var(--text-muted)] mt-1">
                                with {item.attendeeName}
                            </div>
                        )}
                    </div>
                </div>

                {/* Priority Badge */}
                {item.priority !== 'ROUTINE' && priorityColor && (
                    <div 
                        className="flex-shrink-0 px-2 py-0.5 rounded text-[10px] font-mono font-medium uppercase tracking-wider"
                        style={{ 
                            backgroundColor: priorityColor.dark, 
                            color: 'white' // Assuming dark palette creates enough contrast 
                        }}
                    >
                        {item.priority}
                    </div>
                )}
            </div>

            {/* Bottom Metadata Row: Times and Actions */}
            {(hasTimeInfo || item.joinUrl) && (
                <div className="flex items-center gap-4 mt-1 pl-8 text-xs text-[var(--text-muted)]">
                    {hasTimeInfo && (
                        <div className="flex items-center gap-1.5">
                            <Clock size={12} />
                            <span>
                                {formatTime(item.startTime)}
                                {item.endTime ? ` - ${formatTime(item.endTime)}` : ''}
                            </span>
                        </div>
                    )}
                    
                    {item.joinUrl && (
                        <a 
                            href={item.joinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[var(--accent)] font-medium hover:underline flex items-center gap-1"
                        >
                            Join Video
                        </a>
                    )}
                </div>
            )}
        </motion.div>
    );
}
