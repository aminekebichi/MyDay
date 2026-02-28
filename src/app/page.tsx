import { CalendarStrip } from "@/components/home/CalendarStrip";

export default function Home() {
    return (
        <main className="min-h-screen p-4 md:p-8 space-y-8">
            <header className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">Today</h1>
            </header>

            <div className="w-full">
                <CalendarStrip />
            </div>

            <section className="space-y-4">
                {/* Other sections will be added here */}
            </section>
        </main>
    );
}
