import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CalendarStrip } from './CalendarStrip';
import { useStore } from '../../lib/store';
import { addDays, startOfDay, format } from 'date-fns';

// Mock the CSS file since environment doesn't load it
vi.mock('../../../app/globals.css', () => ({}));

// Create a date we can assert against deterministically
const MOCK_TODAY = startOfDay(new Date());

describe('CalendarStrip', () => {
    beforeEach(() => {
        // Clear Zustand store
        useStore.setState({ items: [], sessionUser: null });
        vi.clearAllMocks();
    });

    it('renders the weekly calendar nav aria-label', () => {
        render(<CalendarStrip />);
        expect(screen.getByRole('navigation', { name: "Weekly calendar" })).toBeInTheDocument();
    });

    it('renders 7 day column buttons', () => {
        render(<CalendarStrip />);
        const buttons = screen.getAllByRole('button');
        expect(buttons).toHaveLength(7);
    });

    it('renders an item within the correct day column', () => {
        useStore.setState({
            items: [
                {
                    id: '1',
                    userId: '1',
                    title: 'Test Critical Task',
                    type: 'TASK',
                    priority: 'CRITICAL',
                    date: MOCK_TODAY.toISOString(),
                    recurrence: 'NONE',
                    startTime: null,
                    endTime: null,
                    notes: null,
                    attendeeName: null,
                    joinUrl: null,
                    location: null,
                    completedAt: null,
                    createdAt: new Date().toISOString()
                }
            ]
        });

        render(<CalendarStrip />);
        expect(screen.getByText('Test Critical Task')).toBeInTheDocument();

        // Assert aria label on today's button contains "1 items"
        const todayStr = format(MOCK_TODAY, 'EEEE, MMMM do');
        expect(screen.getByRole('button', { name: `${todayStr} — 1 items` })).toBeInTheDocument();
    });

    it('renders +N more chip when items exceed 3', () => {
        const mockItems = Array.from({ length: 5 }).map((_, i) => ({
            id: String(i),
            userId: '1',
            title: `Task ${i}`,
            type: 'TASK',
            priority: 'ROUTINE',
            date: MOCK_TODAY.toISOString(),
            recurrence: 'NONE',
            startTime: null,
            endTime: null,
            notes: null,
            attendeeName: null,
            joinUrl: null,
            location: null,
            completedAt: null,
            createdAt: new Date().toISOString()
        }));

        useStore.setState({ items: mockItems });
        render(<CalendarStrip />);

        expect(screen.getByText('+2 more')).toBeInTheDocument();
    });
});
