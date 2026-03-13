"use client";

import { useState, useEffect, useRef } from 'react';
import { format, parseISO } from 'date-fns';
import { useStore } from '../../lib/store';
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

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

type Recurrence = 'NONE' | 'DAILY' | 'WEEKLY' | 'MONTHLY';

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

export function AddItemSheet() {
    const isAddOpen = useStore((state) => state.isAddSheetOpen);
    const setIsAddOpen = useStore((state) => state.setIsAddSheetOpen);
    const editingItem = useStore((state) => state.editingItem);
    const setEditingItem = useStore((state) => state.setEditingItem);
    const addItem = useStore((state) => state.addItem);
    const updateItem = useStore((state) => state.updateItem);
    const deleteItem = useStore((state) => state.deleteItem);
    const sessionUser = useStore((state) => state.sessionUser);
    const token = useStore((state) => state.token);
    const viewedUserId = useStore((state) => state.viewedUserId);

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
        }
        setError(null);
        setIsSubmitting(false);
        setTimeout(() => titleRef.current?.focus(), 50);
    }, [isOpen, isEditing, editingItem]);

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

        // Admin support: create for viewed user if not 'all'
        if (sessionUser?.role === 'ADMIN' && viewedUserId && viewedUserId !== 'all' && viewedUserId !== sessionUser?.id) {
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
            const previous = { ...editingItem };
            updateItem(editingItem.id, payload);
            close();

            try {
                const res = await fetch(`/api/items/${editingItem.id}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Session-Token': token || "",
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
                updateItem(previous.id, previous);
                setIsSubmitting(false);
                setEditingItem(previous);
                setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
            }
        } else {
            const tempId = `temp_${Date.now()}`;
            addItem({ id: tempId, ...payload, completedAt: null, createdAt: new Date().toISOString() });
            close();

            try {
                const res = await fetch('/api/items', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Session-Token': token || "",
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
            <div className="absolute inset-0 bg-black/60" onClick={close} aria-hidden="true" />
            <div
                role="dialog"
                aria-modal="true"
                className="relative w-full rounded-2xl flex flex-col overflow-hidden"
                style={{
                    backgroundColor: 'var(--bg-elevated)',
                    maxWidth: 500,
                    maxHeight: '90vh',
                    border: '1px solid var(--border)',
                }}
            >
                <div className="flex items-center justify-between px-4 py-3 border-b flex-none" style={{ borderColor: 'var(--border)' }}>
                    <h2 className="text-base font-instrument" style={{ color: 'var(--text-primary)' }}>
                        {isEditing ? 'Edit item' : 'Add to MyDay'}
                    </h2>
                    <button onClick={close} className="text-muted p-2" style={{ color: 'var(--text-muted)' }}>✕</button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                    <div className="overflow-y-auto flex-1 p-4 space-y-4">
                        {error && (
                            <div className="px-3 py-2 rounded bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-mono">
                                {error}
                            </div>
                        )}

                        <div>
                            <p className="text-[10px] uppercase tracking-wider mb-2 font-mono" style={{ color: 'var(--text-muted)' }}>Type</p>
                            <div className="flex gap-1.5 flex-wrap">
                                {ITEM_TYPES.map(({ value, label }) => (
                                    <button
                                        key={value}
                                        type="button"
                                        onClick={() => setType(value)}
                                        className={`px-3 py-1 rounded-md text-[11px] font-mono border transition-all ${type === value ? 'bg-accent text-white border-accent' : 'bg-surface text-muted border-border'}`}
                                        style={{ 
                                            backgroundColor: type === value ? 'var(--accent)' : 'var(--bg-surface)',
                                            borderColor: type === value ? 'var(--accent)' : 'var(--border)',
                                            color: type === value ? 'white' : 'var(--text-muted)'
                                        }}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <Label className="text-[10px] uppercase font-mono mb-2 block" style={{ color: 'var(--text-muted)' }}>Title</Label>
                            <Input
                                ref={titleRef}
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="What's happening?"
                                style={inputStyle}
                                className="font-mono text-sm"
                            />
                        </div>

                        <div className="flex gap-3">
                            <div className="flex-1">
                                <Label className="text-[10px] uppercase font-mono mb-2 block" style={{ color: 'var(--text-muted)' }}>Date</Label>
                                <Input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    style={{ ...inputStyle, colorScheme: 'dark' }}
                                    className="font-mono text-xs"
                                />
                            </div>
                        </div>

                        {showTimeFields && (
                            <div className="flex gap-3">
                                <div className="flex-1">
                                    <Label className="text-[10px] uppercase font-mono mb-2 block" style={{ color: 'var(--text-muted)' }}>Start</Label>
                                    <Input
                                        type="time"
                                        value={startTime}
                                        onChange={(e) => setStartTime(e.target.value)}
                                        style={{ ...inputStyle, colorScheme: 'dark' }}
                                        className="font-mono text-xs"
                                    />
                                </div>
                                <div className="flex-1">
                                    <Label className="text-[10px] uppercase font-mono mb-2 block" style={{ color: 'var(--text-muted)' }}>End</Label>
                                    <Input
                                        type="time"
                                        value={endTime}
                                        onChange={(e) => setEndTime(e.target.value)}
                                        style={{ ...inputStyle, colorScheme: 'dark' }}
                                        className="font-mono text-xs"
                                    />
                                </div>
                            </div>
                        )}

                        {showLocationField && (
                            <div>
                                <Label className="text-[10px] uppercase font-mono mb-2 block" style={{ color: 'var(--text-muted)' }}>Location</Label>
                                <Input
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    placeholder="Where at?"
                                    style={inputStyle}
                                    className="font-mono text-xs"
                                />
                            </div>
                        )}

                        {showJoinUrlField && (
                            <div>
                                <Label className="text-[10px] uppercase font-mono mb-2 block" style={{ color: 'var(--text-muted)' }}>Join URL</Label>
                                <Input
                                    value={joinUrl}
                                    onChange={(e) => setJoinUrl(e.target.value)}
                                    placeholder="Meeting link"
                                    style={inputStyle}
                                    className="font-mono text-xs"
                                />
                            </div>
                        )}

                        {showAttendeeField && (
                            <div>
                                <Label className="text-[10px] uppercase font-mono mb-2 block" style={{ color: 'var(--text-muted)' }}>Attendee</Label>
                                <Input
                                    value={attendeeName}
                                    onChange={(e) => setAttendeeName(e.target.value)}
                                    placeholder="Name"
                                    style={inputStyle}
                                    className="font-mono text-xs"
                                />
                            </div>
                        )}

                        <div>
                            <p className="text-[10px] uppercase tracking-wider mb-2 font-mono" style={{ color: 'var(--text-muted)' }}>Priority</p>
                            <div className="flex gap-2">
                                {PRIORITIES.map(({ value, label }) => (
                                    <button
                                        key={value}
                                        type="button"
                                        onClick={() => setPriority(value)}
                                        className={`flex-1 py-1.5 rounded-md text-[11px] font-mono border transition-all ${priority === value ? 'border-accent bg-accent/10 text-primary' : 'border-border bg-surface text-muted'}`}
                                        style={{ 
                                            borderColor: priority === value ? 'var(--accent)' : 'var(--border)',
                                            color: priority === value ? 'var(--text-primary)' : 'var(--text-muted)'
                                        }}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <Label className="text-[10px] uppercase font-mono mb-2 block" style={{ color: 'var(--text-muted)' }}>Repeat</Label>
                            <select
                                value={recurrence}
                                onChange={(e) => setRecurrence(e.target.value as Recurrence)}
                                className="w-full px-3 py-2 rounded-lg text-xs font-mono outline-none appearance-none"
                                style={{ ...inputStyle, colorScheme: 'dark' }}
                            >
                                {RECURRENCES.map(({ value, label }) => (
                                    <option key={value} value={value}>{label}</option>
                                ))}
                            </select>
                        </div>

                        {recurrence !== 'NONE' && (
                            <div>
                                <Label className="text-[10px] uppercase font-mono mb-2 block" style={{ color: 'var(--text-muted)' }}>Repeat Until (optional)</Label>
                                <Input
                                    type="date"
                                    value={recurrenceEndDate}
                                    onChange={(e) => setRecurrenceEndDate(e.target.value)}
                                    style={{ ...inputStyle, colorScheme: 'dark' }}
                                    className="font-mono text-xs"
                                />
                            </div>
                        )}

                        <div>
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
                                    className="w-full mt-2 px-3 py-2 rounded-lg text-xs font-mono outline-none resize-none"
                                    style={inputStyle}
                                />
                            )}
                        </div>
                    </div>

                    <div className="p-4 border-t flex gap-3 flex-none" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-elevated)' }}>
                        <Button variant="outline" onClick={close} className="flex-1" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>Cancel</Button>
                        <Button 
                            disabled={!canSave} 
                            onClick={handleSubmit} 
                            className="flex-1" 
                            style={{ backgroundColor: canSave ? 'var(--accent)' : 'var(--border)', color: 'white' }}
                        >
                            {isSubmitting ? 'Saving...' : isEditing ? 'Update' : 'Save'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
