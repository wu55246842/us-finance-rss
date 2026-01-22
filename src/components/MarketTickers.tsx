'use client';

import { motion } from 'framer-motion';
import { MarketQuote } from '@/lib/api/market';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { clsx } from 'clsx';

interface MarketTickersProps {
    quotes: MarketQuote[];
}

export function MarketTickers({ quotes }: MarketTickersProps) {
    if (!quotes || quotes.length === 0) return null;

    return (
        <div className="w-full relative py-2 overflow-hidden">
            {/* Background Accent */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 pointer-events-none" />

            <div className="container mx-auto px-4 md:px-6 max-w-7xl relative z-10">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
                    {quotes.map((quote, idx) => {
                        const isUp = quote.change > 0;
                        const isDown = quote.change < 0;

                        const colorClass = isUp
                            ? 'from-emerald-500/10 to-emerald-500/5 border-emerald-500/30 text-emerald-500'
                            : isDown
                                ? 'from-rose-500/10 to-rose-500/5 border-rose-500/30 text-rose-500'
                                : 'from-slate-500/10 to-slate-500/5 border-slate-500/30 text-slate-400';

                        return (
                            <motion.div
                                key={quote.symbol}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.05, type: 'spring', stiffness: 200 }}
                                className={clsx(
                                    "relative group overflow-hidden rounded-2xl border bg-gradient-to-br p-4 backdrop-blur-md transition-all hover:shadow-lg hover:-translate-y-1",
                                    colorClass
                                )}
                            >
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-black uppercase tracking-widest opacity-80">
                                            {quote.label}
                                        </span>
                                        {isUp ? <TrendingUp size={14} /> : isDown ? <TrendingDown size={14} /> : <Minus size={14} />}
                                    </div>

                                    <div className="mt-1">
                                        <div className="text-xl font-black tracking-tight leading-none">
                                            {typeof quote.currentPrice === 'number'
                                                ? quote.currentPrice.toLocaleString(undefined, {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2
                                                })
                                                : '0.00'}
                                        </div>
                                        <div className={clsx(
                                            "mt-1.5 flex items-center text-xs font-bold",
                                            isUp ? 'text-emerald-400' : isDown ? 'text-rose-400' : 'text-slate-400'
                                        )}>
                                            <span className="opacity-90">
                                                {quote.change > 0 ? '+' : ''}
                                                {typeof quote.percentChange === 'number' ? quote.percentChange.toFixed(2) : '0.00'}%
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Hover Glow */}
                                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-[0.03] transition-opacity pointer-events-none" />
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
