import { z } from 'zod';

export const ItemTypeSchema = z.enum(["TASK", "ASSIGNMENT", "EVENT", "MEETING", "DEADLINE"]);
export const PrioritySchema = z.enum(["ROUTINE", "IMPORTANT", "CRITICAL"]);
export const RecurrenceSchema = z.enum(["NONE", "DAILY", "WEEKLY", "MONTHLY"]);

export const CreateItemSchema = z.object({
    title: z.string().min(1, "Title is required"),
    type: ItemTypeSchema,
    priority: PrioritySchema,
    date: z.string().datetime(), // Must be ISO 8601 string
    startTime: z.string().datetime().optional().nullable(),
    endTime: z.string().datetime().optional().nullable(),
    recurrence: RecurrenceSchema.default("NONE"),
    recurrenceEndDate: z.string().datetime().optional().nullable(),
    notes: z.string().optional().nullable(),
    attendeeName: z.string().optional().nullable(),
    joinUrl: z.union([z.literal(""), z.string().url("Invalid URL")]).optional().nullable(),
    location: z.string().optional().nullable(),
});

export const UpdateItemSchema = CreateItemSchema.partial().extend({
    completedAt: z.string().datetime().optional().nullable(),
});
