'use client';

import { Search } from 'lucide-react';

interface SearchBarProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export function SearchBar({ value, onChange, placeholder = 'Search news...' }: SearchBarProps) {
    return (
        <div className="relative w-full max-w-md">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-4 w-4 text-muted-foreground" />
            </div>
            <input
                type="text"
                className="block w-full rounded-md border border-input bg-background py-2 pl-10 pr-3 text-sm ring-offset-background placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
        </div>
    );
}
