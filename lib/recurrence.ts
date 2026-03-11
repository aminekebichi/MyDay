import { addDays, addWeeks, addMonths, isBefore, isAfter, isSameDay, startOfDay } from 'date-fns';

type Item = any; // We use 'any' here locally to avoid having to import Prisma types before Prisma is generated

export function expandRecurringItems(items: Item[], windowStart: Date, windowEnd: Date): Item[] {
    const expanded: Item[] = [];

    for (const item of items) {
        if (item.recurrence === 'NONE') {
            expanded.push(item);
            continue;
        }

        let currentInstanceDate = new Date(item.date);
        const endDate = item.recurrenceEndDate ? new Date(item.recurrenceEndDate) : windowEnd;
        const effectiveEndDate = isBefore(endDate, windowEnd) ? endDate : windowEnd;

        // Fast-forward to windowStart if the first occurrence is far in the past
        // This is a naive expansion which works well for short ranges (like 1 week)
        let safetyCounter = 0;

        while (isBefore(currentInstanceDate, windowStart) && safetyCounter < 1000) {
            if (item.recurrence === 'DAILY') {
                currentInstanceDate = addDays(currentInstanceDate, 1);
            } else if (item.recurrence === 'WEEKLY') {
                currentInstanceDate = addWeeks(currentInstanceDate, 1);
            } else if (item.recurrence === 'MONTHLY') {
                currentInstanceDate = addMonths(currentInstanceDate, 1);
            } else {
                break;
            }
            safetyCounter++;
        }

        // Now emit instances until the effectiveEndDate
        let instanceCount = 0;
        while (!isAfter(startOfDay(currentInstanceDate), startOfDay(effectiveEndDate)) && instanceCount < 100) {
            if (!isBefore(currentInstanceDate, windowStart)) {
                expanded.push({
                    ...item,
                    // Generate a unique virtual ID to allow mapping on the frontend
                    id: `${item.id}_${currentInstanceDate.toISOString().split('T')[0]}`,
                    date: currentInstanceDate,
                });
            }

            if (item.recurrence === 'DAILY') {
                currentInstanceDate = addDays(currentInstanceDate, 1);
            } else if (item.recurrence === 'WEEKLY') {
                currentInstanceDate = addWeeks(currentInstanceDate, 1);
            } else if (item.recurrence === 'MONTHLY') {
                currentInstanceDate = addMonths(currentInstanceDate, 1);
            } else {
                break;
            }
            instanceCount++;
        }
    }

    return expanded;
}
