import { CalendarStrip } from '../../components/home/CalendarStrip';
import { DayDetailList } from '../../components/home/DayDetailList';

export default function Home() {
    return (
        <main className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)]">
            <div className="max-w-md mx-auto h-full flex flex-col border-x border-[var(--border)] min-h-screen">
                <header className="p-4 bg-[var(--bg-surface)] border-b border-[var(--border)]">
                    <h1 className="text-xl font-instrument">MyDay Preview</h1>
                </header>

                {/* Calendar Strip Section */}
                <section className="bg-[var(--bg-base)] border-b border-[var(--border)] pb-2">
                    <CalendarStrip />
                </section>

                <section className="p-4 flex-1">
                    <DayDetailList />
                </section>
            </div>
        </main>
    );
}
