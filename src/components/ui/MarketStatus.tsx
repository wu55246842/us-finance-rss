'use client';

import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { clsx } from 'clsx';

export function MarketStatus() {
    const [isOpen, setIsOpen] = useState(false);
    const [currentTime, setCurrentTime] = useState<string>('');

    useEffect(() => {
        const checkMarketStatus = () => {
            // Get current time in ET (Eastern Time)
            const etTime = new Intl.DateTimeFormat('en-US', {
                timeZone: 'America/New_York',
                hour: 'numeric',
                minute: 'numeric',
                second: 'numeric',
                hour12: false,
                weekday: 'short',
            }).formatToParts(new Date());

            const parts: Record<string, string> = {};
            etTime.forEach(({ type, value }) => {
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

            // Format current ET time for display
            setCurrentTime(`${parts.hour}:${parts.minute} ET`);
        };

        checkMarketStatus();
        const interval = setInterval(checkMarketStatus, 60000); // Check every minute
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-background/50 border border-border text-[10px] font-bold uppercase tracking-wider">
            <div className={clsx(
                "h-2 w-2 rounded-full",
                isOpen ? "bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-muted-foreground/50"
            )} />
            <span className={clsx(
                isOpen ? "text-emerald-500" : "text-muted-foreground"
            )}>
                Market {isOpen ? 'Live' : 'Closed'}
            </span>
            <span className="hidden sm:inline border-l border-border pl-2 text-muted-foreground/70 lowercase font-medium">
                {currentTime}
            </span>
        </div>
    );
}
