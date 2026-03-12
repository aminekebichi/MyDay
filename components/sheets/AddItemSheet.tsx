"use client";

import { useState, useEffect, useRef } from 'react';
import { format, parseISO } from 'date-fns';
import { useStore } from '../../lib/store';

type ItemType = 'TASK' | 'ASSIGNMENT' | 'EVENT' | 'MEETING' | 'DEADLINE';
type Priority = 'ROUTINE' | 'IMPORTANT' | 'CRITICAL';
type Recurrence = 'NONE' | 'DAILY' | 'WEEKLY' | 'MONTHLY';

const ITEM_TYPES: { value: ItemType; label: string }[] = [
    { value: 'TASK', label: 'Task' },
    { value: 'ASSIGNMENT', label: 'Assignment' },
    { value: 'EVENT', label: 'Event' },
    { value: 'MEETING', label: 'Meeting' },
    { value: 'DEADLINE', label: 'Deadline' },
];

const PRIORITIES: { value: Priority; label: string }[] = [
    { value: 'ROUTINE', label: 'Routine' },
    { value: 'IMPORTANT', label: 'Important' },
    { value: 'CRITICAL', label: 'Critical' },
];

const RECURRENCES: { value: Recurrence; label: string }[] = [
    { value: 'NONE', label: 'None' },
    { value: 'DAILY', label: 'Daily' },
    { value: 'WEEKLY', label: 'Weekly' },
    { value: 'MONTHLY', label: 'Monthly' },
];

const inputStyle: React.CSSProperties = {
    backgroundColor: 'var(--bg-surface)',
    color: 'var(--text-primary)',
    border: '1px solid var(--border)',
};

// Implements #10: Add Item bottom sheet — context-sensitive fields per type
// Also handles editing existing items when editingItem is set in the store
export function AddItemSheet() {
    const isAddOpen = useStore((state: any) => state.isAddSheetOpen);
    const setIsAddOpen = useStore((state: any) => state.setIsAddSheetOpen);
    const editingItem = useStore((state: any) => state.editingItem);
    const setEditingItem = useStore((state: any) => state.setEditingItem);
    const addItem = useStore((state: any) => state.addItem);
    const updateItem = useStore((state: any) => state.updateItem);
    const deleteItem = useStore((state: any) => state.deleteItem);
    const token = useStore((state: any) => state.token);
    const viewedUserId = useStore((state: any) => state.viewedUserId);
    const sessionUser = useStore((state: any) => state.sessionUser);

    const isOpen = isAddOpen || editingItem !== null;
    const isEditing = editingItem !== null;

    const [type, setType] = useState<ItemType>('TASK');
    const [title, setTitle] = useState('');
    const [date, setDate] = useState('');
    const [priority, setPriority] = useState<Priority>('ROUTINE');
    const [recurrence, setRecurrence] = useState<Recurrence>('NONE');
    const [recurrenceEndDate, setRecurrenceEndDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [location, setLocation] = useState('');
    const [joinUrl, setJoinUrl] = useState('');
    const [attendeeName, setAttendeeName] = useState('');
    const [notes, setNotes] = useState('');
    const [showNotes, setShowNotes] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const titleRef = useRef<HTMLInputElement>(null);

    const showTimeFields = type === 'EVENT' || type === 'MEETING';
    const showLocationField = type === 'EVENT' || type === 'MEETING';
    const showJoinUrlField = type === 'MEETING';
    const showAttendeeField = type === 'MEETING';

    const close = () => {
        setIsAddOpen(false);
        setEditingItem(null);
    };

    // Populate form when sheet opens
    useEffect(() => {
        if (!isOpen) return;
        if (isEditing) {
            const item = editingItem;
            setType(item.type ?? 'TASK');
            setTitle(item.title ?? '');
            setDate(item.date ? format(parseISO(item.date), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'));
            setPriority(item.priority ?? 'ROUTINE');
            setRecurrence(item.recurrence ?? 'NONE');
            setRecurrenceEndDate(item.recurrenceEndDate ? format(parseISO(item.recurrenceEndDate), 'yyyy-MM-dd') : '');
            setStartTime(item.startTime ? format(parseISO(item.startTime), 'HH:mm') : '');
            setEndTime(item.endTime ? format(parseISO(item.endTime), 'HH:mm') : '');
            setLocation(item.location ?? '');
            setJoinUrl(item.joinUrl ?? '');
            setAttendeeName(item.attendeeName ?? '');
            setNotes(item.notes ?? '');
            setShowNotes(!!item.notes);
        } else {
            setType('TASK');
            setTitle('');
            setDate(format(new Date(), 'yyyy-MM-dd'));
            setPriority('ROUTINE');
            setRecurrence('NONE');
            setRecurrenceEndDate('');
            setStartTime('');
            setEndTime('');
            setLocation('');
            setJoinUrl('');
            setAttendeeName('');
            setNotes('');
            setShowNotes(false);
        }
        setError(null);
        setIsSubmitting(false);
        setTimeout(() => titleRef.current?.focus(), 50);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    const canSave = title.trim().length > 0 && date.length > 0 && !isSubmitting;

    const buildPayload = () => {
        const payload: Record<string, unknown> = {
            title: title.trim(),
            type,
            priority,
            date: new Date(date + 'T00:00:00').toISOString(),
            recurrence,
        };

        if (showTimeFields && startTime) {
            payload.startTime = new Date(date + 'T' + startTime + ':00').toISOString();
        }
        if (showTimeFields && endTime) {
            payload.endTime = new Date(date + 'T' + endTime + ':00').toISOString();
        }
        if (showLocationField && location.trim()) payload.location = location.trim();
        if (showJoinUrlField && joinUrl.trim()) payload.joinUrl = joinUrl.trim();
        if (showAttendeeField && attendeeName.trim()) payload.attendeeName = attendeeName.trim();
        if (recurrence !== 'NONE' && recurrenceEndDate) {
            payload.recurrenceEndDate = new Date(recurrenceEndDate + 'T00:00:00').toISOString();
        }
        if (notes.trim()) payload.notes = notes.trim();

        // Admin override: specify target user if viewing someone else
        if (sessionUser?.role === 'ADMIN' && viewedUserId && viewedUserId !== sessionUser.id) {
            payload.userId = viewedUserId;
        }

        return payload;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!canSave) return;

        setIsSubmitting(true);
        setError(null);

        const payload = buildPayload();

        if (isEditing) {
            // — Edit flow —
            const previous = { ...editingItem };
            // Optimistic update
            updateItem(editingItem.id, payload);
            close();

            try {
                const res = await fetch(`/api/items/${editingItem.id}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Session-Token': token || '',
                    },
                    body: JSON.stringify(payload),
                });

                if (!res.ok) {
                    const data = await res.json().catch(() => ({}));
                    throw new Error((data as { error?: string }).error ?? 'Failed to update item');
                }

                const updated = await res.json();
                updateItem(editingItem.id, updated);
            } catch (err) {
                // Rollback
                updateItem(previous.id, previous);
                setIsSubmitting(false);
                setEditingItem(previous);
                setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
            }
        } else {
            // — Add flow —
            const tempId = `temp_${Date.now()}`;
            addItem({ id: tempId, ...payload, completedAt: null, createdAt: new Date().toISOString() });
            close();

            try {
                const res = await fetch('/api/items', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Session-Token': 'usr_test_123',
                    },
                    body: JSON.stringify(payload),
                });

                if (!res.ok) {
                    const data = await res.json().catch(() => ({}));
                    throw new Error((data as { error?: string }).error ?? 'Failed to save item');
                }

                const newItem = await res.json();
                deleteItem(tempId);
                addItem(newItem);
            } catch (err) {
                deleteItem(tempId);
                setIsSubmitting(false);
                setIsAddOpen(true);
                setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
            }
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60"
                onClick={close}
                aria-hidden="true"
            />

            {/* Dialog panel */}
            <div
                role="dialog"
                aria-modal="true"
                aria-label={isEditing ? 'Edit item' : 'Add item to MyDay'}
                className="relative w-full rounded-2xl flex flex-col"
                style={{
                    backgroundColor: 'var(--bg-elevated)',
                    maxWidth: 672,
                    maxHeight: '90vh',
                    border: '1px solid var(--border)',
                }}
            >
                {/* Header */}
                <div
                    className="flex items-center justify-between px-4 py-3 border-b flex-none"
                    style={{ borderColor: 'var(--border)' }}
                >
                    <h2
                        className="text-base font-instrument"
                        style={{ color: 'var(--text-primary)' }}
                    >
                        {isEditing ? 'Edit item' : 'Add to MyDay'}
                    </h2>
                    <button
                        type="button"
                        onClick={close}
                        aria-label="Close sheet"
                        className="flex items-center justify-center w-[44px] h-[44px] -mr-2 rounded-xl text-lg"
                        style={{ color: 'var(--text-muted)' }}
                    >
                        ✕
                    </button>
                </div>

                {/* Form */}
                <form
                    id="add-item-form"
                    onSubmit={handleSubmit}
                    className="flex flex-col flex-1 overflow-hidden"
                >
                    {/* Scrollable fields */}
                    <div className="overflow-y-auto flex-1 pb-2">

                        {error && (
                            <div
                                className="mx-4 mt-3 px-3 py-2 rounded-lg text-sm font-mono"
                                style={{
                                    backgroundColor: '#8A3A3A22',
                                    color: '#C87070',
                                    border: '1px solid #8A3A3A',
                                }}
                            >
                                {error}
                            </div>
                        )}

                        {/* Type selector */}
                        <div className="px-4 pt-4">
                            <p
                                className="text-xs uppercase tracking-wide mb-2 font-mono"
                                style={{ color: 'var(--text-muted)' }}
                            >
                                Type
                            </p>
                            <div
                                className="flex gap-1.5 flex-wrap"
                                role="group"
                                aria-label="Item type"
                            >
                                {ITEM_TYPES.map(({ value, label }) => (
                                    <button
                                        key={value}
                                        type="button"
                                        onClick={() => setType(value)}
                                        aria-pressed={type === value}
                                        className="px-3 py-1.5 rounded-lg text-xs font-mono transition-colors"
                                        style={{
                                            backgroundColor:
                                                type === value ? 'var(--accent)' : 'var(--bg-surface)',
                                            color: type === value ? '#fff' : 'var(--text-muted)',
                                            border: `1px solid ${type === value ? 'var(--accent)' : 'var(--border)'}`,
                                        }}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Title */}
                        <div className="px-4 pt-4">
                            <label
                                htmlFor="item-title"
                                className="block text-xs uppercase tracking-wide mb-2 font-mono"
                                style={{ color: 'var(--text-muted)' }}
                            >
                                Title
                            </label>
                            <input
                                ref={titleRef}
                                id="item-title"
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="What's on your plate?"
                                required
                                className="w-full px-3 py-2.5 rounded-lg text-sm font-mono outline-none"
                                style={inputStyle}
                            />
                        </div>

                        {/* Date */}
                        <div className="px-4 pt-4">
                            <label
                                htmlFor="item-date"
                                className="block text-xs uppercase tracking-wide mb-2 font-mono"
                                style={{ color: 'var(--text-muted)' }}
                            >
                                Date
                            </label>
                            <input
                                id="item-date"
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                required
                                className="w-full px-3 py-2.5 rounded-lg text-sm font-mono outline-none"
                                style={{ ...inputStyle, colorScheme: 'dark' }}
                            />
                        </div>

                        {/* Start + End Time — EVENT and MEETING only */}
                        {showTimeFields && (
                            <div className="px-4 pt-4 flex gap-3">
                                <div className="flex-1">
                                    <label
                                        htmlFor="item-start-time"
                                        className="block text-xs uppercase tracking-wide mb-2 font-mono"
                                        style={{ color: 'var(--text-muted)' }}
                                    >
                                        Start
                                    </label>
                                    <input
                                        id="item-start-time"
                                        type="time"
                                        value={startTime}
                                        onChange={(e) => setStartTime(e.target.value)}
                                        className="w-full px-3 py-2.5 rounded-lg text-sm font-mono outline-none"
                                        style={{ ...inputStyle, colorScheme: 'dark' }}
                                    />
                                </div>
                                <div className="flex-1">
                                    <label
                                        htmlFor="item-end-time"
                                        className="block text-xs uppercase tracking-wide mb-2 font-mono"
                                        style={{ color: 'var(--text-muted)' }}
                                    >
                                        End
                                    </label>
                                    <input
                                        id="item-end-time"
                                        type="time"
                                        value={endTime}
                                        onChange={(e) => setEndTime(e.target.value)}
                                        className="w-full px-3 py-2.5 rounded-lg text-sm font-mono outline-none"
                                        style={{ ...inputStyle, colorScheme: 'dark' }}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Location — EVENT and MEETING only */}
                        {showLocationField && (
                            <div className="px-4 pt-4">
                                <label
                                    htmlFor="item-location"
                                    className="block text-xs uppercase tracking-wide mb-2 font-mono"
                                    style={{ color: 'var(--text-muted)' }}
                                >
                                    Location
                                </label>
                                <input
                                    id="item-location"
                                    type="text"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    placeholder="Room 204 or 123 Main St"
                                    className="w-full px-3 py-2.5 rounded-lg text-sm font-mono outline-none"
                                    style={inputStyle}
                                />
                            </div>
                        )}

                        {/* Join URL — MEETING only */}
                        {showJoinUrlField && (
                            <div className="px-4 pt-4">
                                <label
                                    htmlFor="item-join-url"
                                    className="block text-xs uppercase tracking-wide mb-2 font-mono"
                                    style={{ color: 'var(--text-muted)' }}
                                >
                                    Join Link
                                </label>
                                <input
                                    id="item-join-url"
                                    type="url"
                                    value={joinUrl}
                                    onChange={(e) => setJoinUrl(e.target.value)}
                                    placeholder="https://meet.google.com/..."
                                    className="w-full px-3 py-2.5 rounded-lg text-sm font-mono outline-none"
                                    style={inputStyle}
                                />
                            </div>
                        )}

                        {/* Attendee Name — MEETING only */}
                        {showAttendeeField && (
                            <div className="px-4 pt-4">
                                <label
                                    htmlFor="item-attendee"
                                    className="block text-xs uppercase tracking-wide mb-2 font-mono"
                                    style={{ color: 'var(--text-muted)' }}
                                >
                                    Attendee
                                </label>
                                <input
                                    id="item-attendee"
                                    type="text"
                                    value={attendeeName}
                                    onChange={(e) => setAttendeeName(e.target.value)}
                                    placeholder="Name"
                                    className="w-full px-3 py-2.5 rounded-lg text-sm font-mono outline-none"
                                    style={inputStyle}
                                />
                            </div>
                        )}

                        {/* Priority */}
                        <div className="px-4 pt-4">
                            <p
                                className="text-xs uppercase tracking-wide mb-2 font-mono"
                                style={{ color: 'var(--text-muted)' }}
                            >
                                Priority
                            </p>
                            <div className="flex gap-1.5" role="group" aria-label="Priority">
                                {PRIORITIES.map(({ value, label }) => (
                                    <button
                                        key={value}
                                        type="button"
                                        onClick={() => setPriority(value)}
                                        aria-pressed={priority === value}
                                        className="flex-1 py-2 rounded-lg text-xs font-mono transition-colors"
                                        style={{
                                            backgroundColor:
                                                priority === value ? 'var(--bg-surface)' : 'transparent',
                                            color:
                                                priority === value
                                                    ? 'var(--text-primary)'
                                                    : 'var(--text-muted)',
                                            border: `1px solid ${priority === value ? 'var(--accent)' : 'var(--border)'}`,
                                        }}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Recurrence */}
                        <div className="px-4 pt-4">
                            <label
                                htmlFor="item-recurrence"
                                className="block text-xs uppercase tracking-wide mb-2 font-mono"
                                style={{ color: 'var(--text-muted)' }}
                            >
                                Repeat
                            </label>
                            <select
                                id="item-recurrence"
                                value={recurrence}
                                onChange={(e) => setRecurrence(e.target.value as Recurrence)}
                                className="w-full px-3 py-2.5 rounded-lg text-sm font-mono outline-none appearance-none"
                                style={inputStyle}
                            >
                                {RECURRENCES.map(({ value, label }) => (
                                    <option key={value} value={value}>
                                        {label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Recurrence end date — only when recurrence is active */}
                        {recurrence !== 'NONE' && (
                            <div className="px-4 pt-3">
                                <label
                                    htmlFor="item-recurrence-end"
                                    className="block text-xs uppercase tracking-wide mb-2 font-mono"
                                    style={{ color: 'var(--text-muted)' }}
                                >
                                    Repeat Until (optional)
                                </label>
                                <input
                                    id="item-recurrence-end"
                                    type="date"
                                    value={recurrenceEndDate}
                                    onChange={(e) => setRecurrenceEndDate(e.target.value)}
                                    className="w-full px-3 py-2.5 rounded-lg text-sm font-mono outline-none"
                                    style={{ ...inputStyle, colorScheme: 'dark' }}
                                />
                            </div>
                        )}

                        {/* Notes — collapsed by default */}
                        <div className="px-4 pt-4 pb-2">
                            <button
                                type="button"
                                onClick={() => setShowNotes(!showNotes)}
                                aria-expanded={showNotes}
                                className="flex items-center gap-1.5 text-xs font-mono"
                                style={{ color: 'var(--text-muted)' }}
                            >
                                <span aria-hidden="true">{showNotes ? '▾' : '▸'}</span>
                                <span>Notes (optional)</span>
                            </button>
                            {showNotes && (
                                <textarea
                                    aria-label="Notes"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Any additional details..."
                                    rows={3}
                                    className="w-full mt-2 px-3 py-2.5 rounded-lg text-sm font-mono outline-none resize-none"
                                    style={inputStyle}
                                />
                            )}
                        </div>
                    </div>

                    {/* Footer — Save + Cancel */}
                    <div
                        className="px-4 py-4 border-t flex gap-3 flex-none"
                        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-elevated)' }}
                    >
                        <button
                            type="button"
                            onClick={close}
                            className="flex-1 py-3 rounded-xl text-sm font-mono transition-colors"
                            style={{
                                backgroundColor: 'var(--bg-surface)',
                                color: 'var(--text-muted)',
                                border: '1px solid var(--border)',
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!canSave}
                            className="flex-1 py-3 rounded-xl text-sm font-mono transition-all"
                            style={{
                                backgroundColor: canSave ? 'var(--accent)' : 'var(--bg-surface)',
                                color: canSave ? '#fff' : 'var(--text-muted)',
                                opacity: canSave ? 1 : 0.5,
                                cursor: canSave ? 'pointer' : 'not-allowed',
                            }}
                        >
                            {isSubmitting ? 'Saving…' : isEditing ? 'Update' : 'Save'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
