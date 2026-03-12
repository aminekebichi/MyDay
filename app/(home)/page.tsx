import { CalendarStrip } from '../../components/home/CalendarStrip';
import { TodoToday } from '../../components/home/TodoToday';
import { AddItemSheet } from '../../components/sheets/AddItemSheet';
import { AddButton } from '../../components/home/AddButton';

export default function Home() {
    return (
        <main className="min-h-screen" style={{ backgroundColor: 'var(--bg-base)' }}>
            {/* Full-width container — expands to fill the viewport at all screen sizes */}
            <div className="w-full min-h-screen flex flex-col relative">
                {/* App header */}
                <header
                    className="px-4 py-3 border-b flex-none"
                    style={{
                        backgroundColor: 'var(--bg-surface)',
                        borderColor: 'var(--border)',
                    }}
                >
                    <h1
                        className="text-xl font-instrument"
                        style={{ color: 'var(--text-primary)' }}
                    >
                        MyDay
                    </h1>
                </header>

                {/* ── SECTION 1: Scrollable carousel calendar ───────────────────────
                    Implemented in CalendarStrip. Expands to fill its natural height. */}
                <section
                    className="flex-none border-b"
                    style={{ borderColor: 'var(--border)' }}
                    aria-label="Weekly calendar"
                >
                    <CalendarStrip />
                </section>

                {/* ── SECTION 2: Weekly overview ────────────────────────────────────
                    Placeholder — OverviewSection component to be built next. */}
                <section
                    className="flex-none px-4 py-4 border-b"
                    style={{ borderColor: 'var(--border)' }}
                    aria-label="Weekly overview"
                >
                    <p className="font-caveat text-lg" style={{ color: 'var(--text-muted)' }}>
                        {/* Generated summary quip will live here */}
                    </p>
                </section>

                {/* ── SECTION 3: To-Do Today ────────────────────────────────────────
                    Grows to fill remaining vertical space so the page scrolls naturally.
                    Extra bottom padding keeps content clear of the sticky CTA button. */}
                <section className="flex-1 pb-32">
                    <TodoToday />
                </section>
            </div>

            {/* Sticky "Add to MyDay" CTA — fixed to the bottom, spans full viewport width */}
            <AddButton />

            {/* Add Item bottom sheet — rendered at root level (above everything) */}
            <AddItemSheet />
        </main>
    );
}
