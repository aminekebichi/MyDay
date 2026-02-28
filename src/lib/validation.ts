import { z } from "zod";
import { ItemType, Priority, Recurrence } from "@prisma/client";

export const createItemSchema = z.object({
    title: z.string().min(1, "Title is required"),
    type: z.nativeEnum(ItemType),
    priority: z.nativeEnum(Priority),
    date: z.string().transform((val) => new Date(val)),
    time: z.string().optional().transform((val) => (val ? new Date(val) : undefined)),
    recurrence: z.nativeEnum(Recurrence).optional().default(Recurrence.NONE),
    recurrenceEndDate: z.string().optional().transform((val) => (val ? new Date(val) : undefined)),
    notes: z.string().optional(),
    attendeeName: z.string().optional(),
});

export const updateItemSchema = createItemSchema.partial().extend({
    completedAt: z.string().optional().nullable().transform((val) => {
        if (val === null) return null;
        return val ? new Date(val) : undefined;
    }),
});
