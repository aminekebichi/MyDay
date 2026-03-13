export const CATEGORY_COLORS = {
    TASK:       { dark: '#4A72A8', light: '#5A82B8' }, // steel blue
    ASSIGNMENT: { dark: '#1A8A9A', light: '#2A9AAA' }, // teal
    EVENT:      { dark: '#2E7D5A', light: '#3A9A6E' }, // forest green
    MEETING:    { dark: '#7A4EA8', light: '#9060C0' }, // violet purple
    DEADLINE:   { dark: '#A03828', light: '#B84838' }, // warm rust red
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
