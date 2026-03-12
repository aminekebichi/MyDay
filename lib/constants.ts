export const CATEGORY_COLORS = {
    TASK: { dark: '#4A5A7A', light: '#6A7A9A' },
    ASSIGNMENT: { dark: '#7A5030', light: '#9A7050' },
    EVENT: { dark: '#2A5A3A', light: '#3A7A5A' },
    MEETING: { dark: '#3A4A5A', light: '#5A6A7A' },
    DEADLINE: { dark: '#7A3A2A', light: '#9A5040' },
} as const;

export const PRIORITY_COLORS = {
    ROUTINE: { dark: '#888582', light: '#9A9590' },
    IMPORTANT: { dark: '#AA8040', light: '#BA9050' },
    CRITICAL: { dark: '#9A4A35', light: '#AA5A45' },
} as const;

export const PRIORITY_ORDER = {
    CRITICAL: 1,
    IMPORTANT: 2,
    ROUTINE: 3,
} as const;
