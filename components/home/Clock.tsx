"use client";

import { useState, useEffect } from 'react';

export function Clock() {
    const [time, setTime] = useState<Date | null>(null);

    useEffect(() => {
        setTime(new Date());
        const id = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(id);
    }, []);

    if (!time) return null;

    const hours = String(time.getHours()).padStart(2, '0');
    const minutes = String(time.getMinutes()).padStart(2, '0');
    const seconds = String(time.getSeconds()).padStart(2, '0');

    return (
        <span className="text-sm font-mono tabular-nums" style={{ color: 'var(--text-muted)' }}>
            {hours}<span className="opacity-50">:</span>{minutes}<span className="opacity-50">:</span>{seconds}
        </span>
    );
}
