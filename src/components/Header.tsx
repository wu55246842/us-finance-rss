'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { motion, AnimatePresence } from 'framer-motion';
import SearchCommand from '@/components/openstock/SearchCommand';

const NAV_ITEMS = [
    { name: 'Home', href: '/' },
    { name: 'Markets', href: '/markets' },
    { name: 'Macro', href: '/macro' },
    { name: 'Stocks', href: '/stocks/overview' },
    { name: 'Quant', href: '/quant' },
    { name: 'Blog', href: '/blog' },
    { name: 'Sources', href: '/sources' },
];

export function Header() {
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <header
            className={clsx(
                'sticky top-0 z-50 w-full border-b transition-all duration-300',
                scrolled
                    ? 'border-border/40 bg-background/80 backdrop-blur-md shadow-sm'
                    : 'border-transparent bg-background/0'
            )}
        >
            <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6 max-w-7xl">
                <div className="flex items-center gap-2">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="relative overflow-hidden rounded-lg  transition-transform group-hover:scale-105">
                            <div className="flex h-full w-full items-center justify-center  bg-background">
                                <img src="/logo.svg" alt="US Finance RSS" className="h-16 w-auto dark:invert" />
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-6">
                    {NAV_ITEMS.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={clsx(
                                'text-sm font-medium transition-colors hover:text-primary relative py-1',
                                pathname === item.href ? 'text-primary' : 'text-muted-foreground'
                            )}
                        >
                            {item.name}
                            {pathname === item.href && (
                                <motion.div
                                    layoutId="navbar-indicator"
                                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
                                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                                />
                            )}
                        </Link>
                    ))}
                    <div className="ml-2 pl-2 border-l border-border/50 flex items-center gap-4">
                        <SearchCommand renderAs="text" label="Search stocks..." initialStocks={[]} />
                        <ThemeToggle />
                    </div>
                </nav>

                {/* Mobile Menu Button */}
                <div className="flex items-center gap-4 md:hidden">
                    <ThemeToggle />
                    <button
                        className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Nav */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden border-b border-border bg-background/95 backdrop-blur-md overflow-hidden"
                    >
                        <nav className="flex flex-col p-4 space-y-4">
                            {NAV_ITEMS.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={clsx(
                                        'text-sm font-medium transition-colors hover:text-primary px-4 py-2 rounded-md hover:bg-accent',
                                        pathname === item.href ? 'text-primary bg-accent/50' : 'text-muted-foreground'
                                    )}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </nav>
                        <div className="p-4 border-t border-border">
                            <SearchCommand renderAs="button" label="Search stocks..." initialStocks={[]} />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
