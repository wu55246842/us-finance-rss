'use client';

import { Search } from 'lucide-react';
import { motion } from 'framer-motion';

interface HeroProps {
    onSearch: (query: string) => void;
}

export function Hero({ onSearch }: HeroProps) {
    return (
        <section className="relative py-12 md:py-20 overflow-hidden">
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="container px-4 md:px-6 text-center space-y-6 max-w-3xl mx-auto"
            >
                <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                    US Markets & Macro Hub
                </h1>
                <p className="text-lg text-muted-foreground md:text-xl max-w-[700px] mx-auto">
                    Real-time aggregation of US stock market news, economic data, and Federal Reserve updates.
                </p>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                    className="relative max-w-md mx-auto mt-8"
                >
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search news..."
                            onChange={(e) => onSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-background/50 backdrop-blur-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                    </div>
                </motion.div>
            </motion.div>
        </section>
    );
}
