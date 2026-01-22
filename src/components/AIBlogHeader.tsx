'use client';

import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, TrendingUp, Calendar } from 'lucide-react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import { format } from 'date-fns';

interface AIBlogHeaderProps {
    latestAnalysis: {
        id: number;
        title: string;
        content: string;
        createdAt: Date;
    } | null;
    onSearch: (query: string) => void;
}

export function AIBlogHeader({ latestAnalysis, onSearch }: AIBlogHeaderProps) {
    if (!latestAnalysis) return null;

    // Extract summary (first few lines after title)
    const contentLines = latestAnalysis.content.split('\n');
    const summary = contentLines.slice(2, 6).join('\n');

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative mb-12"
        >
            {/* Background Glow */}
            <div className="absolute -inset-1 rounded-[2rem] bg-gradient-to-r from-blue-600 via-purple-600 to-primary opacity-20 blur-xl transition duration-1000 group-hover:opacity-100 group-hover:duration-200" />

            <div className="relative overflow-hidden rounded-[2rem] border border-border/50 bg-background/80 backdrop-blur-md shadow-2xl">
                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                    <TrendingUp size={120} />
                </div>

                <div className="flex flex-col md:flex-row">
                    {/* Left: Content */}
                    <div className="flex-1 p-8 md:p-12 space-y-6">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-bold uppercase tracking-wider">
                                    <TrendingUp size={14} className="animate-pulse" />
                                    Market Report
                                </div>
                                <div className="flex items-center gap-1.5 text-sm text-muted-foreground font-medium">
                                    <Calendar size={14} />
                                    {format(new Date(latestAnalysis.createdAt), 'MMM dd, HH:mm')} SGT
                                </div>
                            </div>

                            {/* Integrated Search */}
                            <div className="relative w-full md:w-64">
                                <TrendingUp className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground opacity-50" />
                                <input
                                    type="text"
                                    placeholder="Search market news..."
                                    onChange={(e) => onSearch(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-border bg-background/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                />
                            </div>
                        </div>

                        <h2 className="text-3xl md:text-4xl font-black tracking-tight text-foreground leading-tight">
                            {latestAnalysis.title}
                        </h2>

                        <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground line-clamp-3">
                            <ReactMarkdown>{summary}</ReactMarkdown>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 pt-4">
                            <Link
                                href={`/blog/ai-${latestAnalysis.id}`}
                                className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-4 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95 group"
                            >
                                Read Full Insights
                                <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                            </Link>

                            <Link
                                href="/analysis-history"
                                className="inline-flex items-center gap-2 rounded-xl px-6 py-4 text-sm font-bold border border-border hover:bg-accent transition-all"
                            >
                                View History
                            </Link>
                        </div>
                    </div>

                    {/* Right: Abstract Decor */}
                    <div className="hidden lg:flex w-1/3 bg-gradient-to-br from-primary/5 via-purple-500/5 to-transparent border-l border-border/50 items-center justify-center p-12">
                        <div className="relative">
                            <div className="w-48 h-48 rounded-full border-4 border-dashed border-primary/20 animate-[spin_20s_linear_infinite]" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <TrendingUp size={64} className="text-primary opacity-40" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
