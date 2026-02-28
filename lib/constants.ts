export const CATEGORY_COLORS = {
    TASK: { dark: '#4A4A8A', light: '#6B6BAA' },
    ASSIGNMENT: { dark: '#6A4A2A', light: '#8B6A4A' },
    EVENT: { dark: '#2A5A4A', light: '#3A7A6A' },
    MEETING: { dark: '#2A4A6A', light: '#3A6A8A' },
    DEADLINE: { dark: '#6A2A2A', light: '#8A4A4A' },
} as const;

export const PRIORITY_COLORS = {
    ROUTINE: { dark: '#7F849C', light: '#9090AA' },
    IMPORTANT: { dark: '#A07A3A', light: '#B08040' },
    CRITICAL: { dark: '#8A3A3A', light: '#9A4040' },
} as const;

export const PRIORITY_ORDER = {
    CRITICAL: 1,
    IMPORTANT: 2,
    ROUTINE: 3,
} as const;
