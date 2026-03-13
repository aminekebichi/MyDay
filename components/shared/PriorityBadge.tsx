import { PRIORITY_COLORS } from '../../lib/constants';

type Priority = 'ROUTINE' | 'IMPORTANT' | 'CRITICAL';

interface PriorityBadgeProps {
    priority: Priority;
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
    const color = PRIORITY_COLORS[priority]?.dark ?? PRIORITY_COLORS.ROUTINE.dark;
    const label = priority.charAt(0) + priority.slice(1).toLowerCase();

    return (
        <span
            className="flex-none text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wide font-mono"
            style={{ color, border: `1px solid ${color}` }}
        >
            {label}
        </span>
    );
}
