export const CATEGORY_COLORS: Record<string, string> = {
    task: "var(--accent-blue)",
    assignment: "var(--accent-purple)",
    event: "var(--accent-green)",
    meeting: "var(--accent-orange)",
    deadline: "var(--accent-red)",
};

export const PRIORITY_LEVELS = {
    CRITICAL: 3,
    IMPORTANT: 2,
    ROUTINE: 1,
} as const;
