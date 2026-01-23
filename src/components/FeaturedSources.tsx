'use client';

import { motion } from 'framer-motion';

const SOURCES = [
    'Federal Reserve',
    'US Treasury',
    'Bureau of Labor Statistics',
    'NYSE',
    'NASDAQ',
    'CME Group',
    'Bloomberg',
    'Reuters',
    'Financial Times',
    'Wall Street Journal',
];

export function FeaturedSources() {
    return (
        <section className="py-12 border-y border-border/50 bg-muted/20">
            <div className="container mx-auto px-4 overflow-hidden">
                <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground mb-8">
                    Institutional Data Sources & Partners
                </p>

                <div className="relative">
                    {/* Gradient Overlays */}
                    <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-background to-transparent z-10" />
                    <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-background to-transparent z-10" />

                    <motion.div
                        initial={{ x: 0 }}
                        animate={{ x: '-50%' }}
                        transition={{
                            duration: 30,
                            repeat: Infinity,
                            ease: 'linear',
                        }}
                        className="flex items-center gap-12 w-fit whitespace-nowrap"
                    >
                        {[...SOURCES, ...SOURCES].map((source, i) => (
                            <span
                                key={i}
                                className="text-xl md:text-2xl font-black text-muted-foreground/30 hover:text-primary/50 transition-colors cursor-default select-none"
                            >
                                {source}
                            </span>
                        ))}
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
