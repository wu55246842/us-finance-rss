'use client';

import { Search } from 'lucide-react';
import { motion } from 'framer-motion';

export function Hero() {
    return (
        <section className="relative py-2 md:py-4 overflow-hidden">
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="container px-4 md:px-6 text-center space-y-6 max-w-4xl mx-auto"
            >
                <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70 leading-tight">
                    US Markets & Macro Hub
                </h1>
                <p className="text-lg text-muted-foreground md:text-xl max-w-[800px] mx-auto leading-relaxed">
                    Real-time aggregation of US stock market news, economic data, institutional-grade market research, and Federal Reserve updates. Powered by multi-agent AI analysis.
                </p>
            </motion.div>
        </section>
    );
}
