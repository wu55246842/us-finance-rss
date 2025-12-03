'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { clsx } from 'clsx';

const NAV_ITEMS = [
    { name: 'Home', href: '/' },
    { name: 'Markets', href: '/markets' },
    { name: 'Macro', href: '/macro' },
    { name: 'Sources', href: '/sources' },
];

export function Header() {
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6 max-w-7xl">
                <div className="flex items-center gap-2">
                    <Link href="/" className="flex items-center gap-2">
                        <img src="/logo.svg" alt="US Finance RSS" className="h-10 w-auto" />
                    </Link>
                </div>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-6">
                    {NAV_ITEMS.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={clsx(
                                'text-sm font-medium transition-colors hover:text-primary',
                                pathname === item.href ? 'text-primary' : 'text-muted-foreground'
                            )}
                        >
                            {item.name}
                        </Link>
                    ))}
                </nav>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden p-2 text-muted-foreground hover:text-foreground"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
            </div>

            {/* Mobile Nav */}
            {isMobileMenuOpen && (
                <div className="md:hidden border-t border-border bg-background">
                    <nav className="flex flex-col p-4 space-y-4">
                        {NAV_ITEMS.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={clsx(
                                    'text-sm font-medium transition-colors hover:text-primary',
                                    pathname === item.href ? 'text-primary' : 'text-muted-foreground'
                                )}
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                {item.name}
                            </Link>
                        ))}
                    </nav>
                </div>
            )}
        </header>
    );
}
