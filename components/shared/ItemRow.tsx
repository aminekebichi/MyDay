"use client";

import { CATEGORY_COLORS } from '../../lib/constants';
import { PriorityBadge } from './PriorityBadge';

// To avoid TS errors until Prisma client is generated
type Item = any;

interface ItemRowProps {
    item: Item;
    onToggle: (id: string, completedAt: string | null) => void;
    onEdit: (item: Item) => void;
}

export function ItemRow({ item, onToggle, onEdit }: ItemRowProps) {
    const isCompleted = !!item.completedAt;
    const categoryColor =
        CATEGORY_COLORS[item.type as keyof typeof CATEGORY_COLORS]?.dark ??
        CATEGORY_COLORS.TASK.dark;

    const handleToggle = () => {
        onToggle(item.id, isCompleted ? null : new Date().toISOString());
    };

    return (
        <div className="flex items-start gap-1 px-4 py-1 border-b group" style={{ borderColor: 'var(--border)' }}>
            {/* Checkbox — 44×44 touch target (WCAG 2.5.5) */}
            <button
                type="button"
                onClick={handleToggle}
                aria-label={
                    isCompleted
                        ? `Mark "${item.title}" incomplete`
                        : `Mark "${item.title}" complete`
                }
                className="flex-none flex items-center justify-center w-[44px] h-[44px] -ml-2"
            >
                <div
                    className="w-5 h-5 rounded border flex items-center justify-center transition-colors"
                    style={{
                        borderColor: isCompleted ? 'var(--accent)' : 'var(--border)',
                        backgroundColor: isCompleted ? 'var(--accent)' : 'transparent',
                    }}
                >
                    {isCompleted && (
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none" aria-hidden="true">
                            <path
                                d="M1 4L3.5 6.5L9 1"
                                stroke="white"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    )}
                </div>
            </button>

            {/* Content — left border stripe for category */}
            <div
                className="flex-1 min-w-0 py-3 pl-3 border-l-2"
                style={{ borderLeftColor: categoryColor }}
            >
                <div className="flex items-center justify-between gap-2">
                    <span
                        className="text-sm leading-snug transition-all duration-200 truncate"
                        style={{
                            color: isCompleted ? 'var(--text-muted)' : 'var(--text-primary)',
                            textDecoration: isCompleted ? 'line-through' : 'none',
                        }}
                    >
                        {item.title}
                    </span>
                    <PriorityBadge priority={item.priority} />
                </div>

                {/* Secondary metadata */}
                {(item.startTime || item.location || item.attendeeName) && (
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
                    </div>
                )}
            </div>

            {/* Edit button — visible on hover, right side */}
            <button
                type="button"
                onClick={() => onEdit(item)}
                aria-label={`Edit "${item.title}"`}
                className="flex-none flex items-center justify-center w-[44px] h-[44px] -mr-2 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ color: 'var(--text-muted)' }}
            >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <path
                        d="M9.5 1.5L12.5 4.5L4.5 12.5H1.5V9.5L9.5 1.5Z"
                        stroke="currentColor"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </button>
        </div>
    );
}
