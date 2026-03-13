"use client";

import { useStore } from "../../lib/store";
import { Checkbox } from "../ui/checkbox";
import { CATEGORY_COLORS, PRIORITY_COLORS } from "../../lib/constants";
import { motion } from "framer-motion";

const PRIORITY_BARS: Record<string, number> = { ROUTINE: 1, IMPORTANT: 2, CRITICAL: 3 };

function PriorityBars({ priority, color }: { priority: string; color: string }) {
    const count = PRIORITY_BARS[priority] ?? 1;
    return (
        <div className="flex-none self-center flex flex-col justify-center gap-[3px]">
            {[0, 1, 2].map((i) => (
                <div
                    key={i}
                    className="rounded-full"
                    style={{
                        width: 14,
                        height: 3,
                        backgroundColor: i < count ? color : 'var(--border)',
                    }}
                />
            ))}
        </div>
    );
}

export function ItemRow({ item, onEdit }: { item: any; onEdit?: (item: any) => void }) {
    const token = useStore((state) => state.token);
    const updateItem = useStore((state) => state.updateItem);

    const isCompleted = !!item.completedAt;

    const handleToggle = async () => {
        const now = new Date().toISOString();
        const newCompletedAt = isCompleted ? null : now;

        // Optimistic update
        updateItem(item.id, { completedAt: newCompletedAt });

        try {
            const res = await fetch(`/api/items/${item.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "X-Session-Token": token || "",
                },
                body: JSON.stringify({ completedAt: newCompletedAt }),
            });

            if (!res.ok) throw new Error("Failed to update item");
        } catch (error) {
            console.error(error);
            // Rollback
            updateItem(item.id, { completedAt: item.completedAt });
        }
    };

    const categoryColor = CATEGORY_COLORS[item.type as keyof typeof CATEGORY_COLORS]?.dark || "#4A4A8A";
    const priorityColor = PRIORITY_COLORS[item.priority as keyof typeof PRIORITY_COLORS]?.dark || "#7F849C";

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="group relative flex items-center gap-3 p-3 rounded-lg border bg-surface transition-all hover:bg-opacity-80"
            style={{ 
                borderColor: 'var(--border)',
                borderLeft: `4px solid ${categoryColor}`,
                backgroundColor: 'var(--bg-surface)'
            }}
        >
            <div className="flex-none self-center">
                <Checkbox
                    checked={isCompleted}
                    onCheckedChange={handleToggle}
                    className="h-[22px] w-[22px] rounded-sm border-2"
                    style={{ borderColor: categoryColor }}
                />
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                    <span
                        className={`text-sm font-geist truncate flex-1 ${isCompleted ? 'line-through opacity-50' : ''}`}
                        style={{ color: isCompleted ? 'var(--text-muted)' : 'var(--text-primary)' }}
                    >
                        {item.title}
                    </span>
                </div>

                {/* Secondary metadata */}
                {(item.startTime || item.location || item.attendeeName || item.user?.displayName) && (
                    <div
                        className="mt-0.5 flex items-center gap-1.5 text-[11px] font-mono"
                        style={{ color: 'var(--text-muted)' }}
                    >
                        {item.startTime && (
                            <time dateTime={item.startTime}>
                                {new Date(item.startTime).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                            </time>
                        )}
                        {item.location && <span>· {item.location}</span>}
                        {item.attendeeName && <span>· {item.attendeeName}</span>}
                        {item.user?.displayName && (
                            <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 ml-1" style={{ color: 'var(--accent)' }}>
                                @{item.user.displayName}
                            </span>
                        )}
                    </div>
                )}
            </div>

            <PriorityBars priority={item.priority} color={priorityColor} />

            {onEdit && (
                <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onEdit(item); }}
                    aria-label={`Edit ${item.title}`}
                    className="flex-none self-center p-1 rounded opacity-60 hover:opacity-100 transition-opacity"
                    style={{ color: 'var(--text-muted)' }}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                </button>
            )}
        </motion.div>
    );
}
