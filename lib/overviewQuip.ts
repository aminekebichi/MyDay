// Template-based weekly summary generator — no AI, client-side only.
import { format } from 'date-fns';

type Item = any;

const NUMBER_WORDS: Record<number, string> = {
    1: 'one', 2: 'two', 3: 'three', 4: 'four', 5: 'five',
    6: 'six', 7: 'seven', 8: 'eight', 9: 'nine',
};

function toWord(n: number): string {
    return NUMBER_WORDS[n] ?? String(n);
}

function plural(word: string, n: number): string {
    const map: Record<string, string> = {
        deadline: 'deadlines', meeting: 'meetings', event: 'events',
        task: 'tasks', assignment: 'assignments', item: 'items',
    };
    return n === 1 ? word : (map[word] ?? word + 's');
}

function article(word: string): string {
    return /^[aeiou]/i.test(word) ? 'an' : 'a';
}

function formatTime(iso: string): string {
    const d = new Date(iso);
    const h = d.getHours();
    const m = d.getMinutes();
    const suffix = h >= 12 ? 'pm' : 'am';
    const hour = h % 12 || 12;
    return m === 0 ? `${hour}${suffix}` : `${hour}:${String(m).padStart(2, '0')}${suffix}`;
}

function describeItem(item: Item): string {
    const type = (item.type as string).toLowerCase();
    const day = format(new Date(item.date), 'EEEE');
    const time = item.startTime ? ` at ${formatTime(item.startTime)}` : '';
    const priority = `${(item.priority as string).toLowerCase()} `;

    if (type === 'meeting') {
        const with_ = item.attendeeName ? ` with ${item.attendeeName}` : ` "${item.title}"`;
        return `${article(priority + 'meeting')} ${priority}meeting${with_}${time} on ${day}`;
    }
    if (type === 'deadline') {
        return `${article(priority + 'deadline')} ${priority}deadline for "${item.title}" on ${day}`;
    }
    if (type === 'event') {
        return `${article(priority + 'event')} ${priority}event "${item.title}"${time} on ${day}`;
    }
    if (type === 'assignment') {
        return `${article(priority + 'assignment')} ${priority}assignment "${item.title}" due ${day}`;
    }
    return `${article(priority + 'task')} ${priority}task "${item.title}" on ${day}`;
}

function joinPhrases(phrases: string[]): string {
    if (phrases.length === 1) return phrases[0];
    return phrases.slice(0, -1).join(', ') + ' and ' + phrases[phrases.length - 1];
}

// Generates a personalized text overview of critical + important items remaining this week.
export function generateWeekOverview(items: Item[]): string {
    const incomplete = items.filter((i) => !i.completedAt);

    if (incomplete.length === 0) {
        if (items.length > 0) return 'Everything important this week is already wrapped up.';
        return 'Nothing critical or important on the radar this week.';
    }

    const critical = incomplete.filter((i) => i.priority === 'CRITICAL');
    const important = incomplete.filter((i) => i.priority === 'IMPORTANT');

    const phrases: string[] = [];

    for (const item of critical.slice(0, 2)) phrases.push(describeItem(item));
    if (critical.length > 2) {
        const r = critical.length - 2;
        phrases.push(`${toWord(r)} more critical ${plural('item', r)}`);
    }

    const importantSlice = critical.length === 0 ? important.slice(0, 2) : important.slice(0, 1);
    for (const item of importantSlice) phrases.push(describeItem(item));
    const skipped = important.length - importantSlice.length;
    if (skipped > 0) {
        phrases.push(`${toWord(skipped)} more important ${plural('item', skipped)}`);
    }

    if (phrases.length === 0) {
        const r = incomplete.length;
        return `You have ${toWord(r)} routine ${plural('item', r)} left this week.`;
    }

    return `You have ${joinPhrases(phrases)} this week.`;
}

// Generates a funny closing quip based on the week's items.
export function generateClosingQuip(items: Item[]): string {
    const incomplete = items.filter((i) => !i.completedAt);
    const critical = incomplete.filter((i) => i.priority === 'CRITICAL');
    const meetings = incomplete.filter((i) => i.type === 'MEETING');
    const deadlines = incomplete.filter((i) => i.type === 'DEADLINE');
    const total = incomplete.length;

    if (total === 0) return "Blissfully quiet. Suspicious, but blissful.";
    if (critical.length >= 3) return "Three critical items in one week? You either love pressure or forgot to plan. Probably both.";
    if (critical.length === 2) return "Two critical items. Double the stakes, double the coffee.";
    if (critical.length === 1 && meetings.length >= 2) return "One critical item and multiple meetings. Classic recipe for a long week.";
    if (critical.length === 1 && deadlines.length >= 1) return "A critical task and a deadline in the same week. Bold scheduling choice.";
    if (critical.length === 1) return "Just the one critical item. Don't let it sneak up on you.";
    if (meetings.length >= 3) return `${meetings.length} meetings this week. Your calendar has commitment issues.`;
    if (meetings.length >= 2) return "Back-to-back meetings incoming. Hope you like the sound of your own voice.";
    if (deadlines.length >= 2) return "Multiple deadlines ahead. Time to actually start those tasks.";
    if (deadlines.length === 1) return "One deadline lurking. It knows where you live.";

    const light = [
        "Not bad at all. You might actually enjoy this week.",
        "A manageable week. Don't waste it overthinking.",
        "Nothing too wild. Go get 'em.",
    ];
    return light[total % light.length];
}
