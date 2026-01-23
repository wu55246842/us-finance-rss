'use client';

import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { clsx } from 'clsx';

export function MarketStatus() {
    const [isOpen, setIsOpen] = useState(false);
    const [currentTime, setCurrentTime] = useState<string>('');

    useEffect(() => {
        const checkMarketStatus = () => {
            // Get current time in ET (Eastern Time) for market logic
            const now = new Date();
            const etTimeParts = new Intl.DateTimeFormat('en-US', {
                timeZone: 'America/New_York',
                hour: 'numeric',
                minute: 'numeric',
                hour12: false,
                weekday: 'short',
            }).formatToParts(now);

            const parts: Record<string, string> = {};
            etTimeParts.forEach(({ type, value }) => {
                parts[type] = value;
            });

            const hour = parseInt(parts.hour);
            const minute = parseInt(parts.minute);
            const weekday = parts.weekday;

            // NYSE Hours: Mon-Fri, 9:30 AM - 4:00 PM ET
            const isWeekday = !['Sat', 'Sun'].includes(weekday);
            const timeInMinutes = hour * 60 + minute;
            const openTime = 9 * 60 + 30; // 9:30
            const closeTime = 16 * 60; // 16:00

            const open = isWeekday && timeInMinutes >= openTime && timeInMinutes < closeTime;
            setIsOpen(open);

            // Get current Singapore time for display
            const sgTime = new Intl.DateTimeFormat('en-US', {
                timeZone: 'Asia/Singapore',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
            }).format(now);

            setCurrentTime(`${sgTime} SGT`);
            console.log('MarketStatus updated with SGT:', sgTime);
        };

        checkMarketStatus();
        const interval = setInterval(checkMarketStatus, 60000); // Check every minute
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-background/50 border border-border text-[9px] font-bold uppercase tracking-tight">
            <div className={clsx(
                "h-1.5 w-1.5 rounded-full",
                isOpen ? "bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-muted-foreground/50"
            )} />
            <span className={clsx(
                isOpen ? "text-emerald-500" : "text-muted-foreground"
            )}>
                {isOpen ? 'Live' : 'Closed'}
            </span>
            <span className="hidden sm:inline border-l border-border pl-1.5 text-muted-foreground/70  font-medium">
                {currentTime}
            </span>
        </div>
    );
}
