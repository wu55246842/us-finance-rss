'use client';

import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, TrendingUp, Calendar, Search } from 'lucide-react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import { format } from 'date-fns';

interface AIBlogHeaderProps {
    latestAnalyses: {
        id: number;
        title: string;
        content: string;
        createdAt: Date;
    }[] | null;
    onSearch: (query: string) => void;
}

export function AIBlogHeader({ latestAnalyses, onSearch }: AIBlogHeaderProps) {
    if (!latestAnalyses || latestAnalyses.length === 0) return null;

    return (
        <div className="relative mb-12 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-bold uppercase tracking-wider">
                        <Sparkles size={14} className="animate-pulse" />
                        AI Market Intelligence
                    </div>
                    <h2 className="text-xl font-bold tracking-tight text-foreground">
                        Recent Market Reports
                    </h2>
                </div>

                {/* Integrated Search */}
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground opacity-50" />
                    <input
                        type="text"
                        placeholder="Search market news..."
                        onChange={(e) => onSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-border bg-background/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {latestAnalyses.map((analysis, idx) => {
                    // Extract summary (first few lines after title)
                    const contentLines = analysis.content.split('\n');
                    const summary = contentLines.slice(2, 6).join('\n');

                    return (
                        <motion.div
                            key={analysis.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="group relative overflow-hidden rounded-3xl border border-border/50 bg-background/60 backdrop-blur-md hover:bg-background/80 transition-all duration-300 shadow-xl hover:shadow-2xl hover:border-primary/20"
                        >
                            <div className="p-6 md:p-8 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                                        <Calendar size={12} />
                                        {format(new Date(analysis.createdAt), 'MMM dd, HH:mm')} SGT
                                    </div>
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                        <TrendingUp size={24} className="text-primary/20" />
                                    </div>
                                </div>

                                <h3 className="text-xl md:text-2xl font-black tracking-tight text-foreground leading-tight line-clamp-2 min-h-[3.5rem] group-hover:text-primary transition-colors">
                                    {analysis.title}
                                </h3>

                                <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground line-clamp-2 h-12 overflow-hidden">
                                    <ReactMarkdown>{summary}</ReactMarkdown>
                                </div>

                                <div className="flex items-center justify-between pt-2">
                                    <Link
                                        href={`/blog/ai-${analysis.id}`}
                                        className="inline-flex items-center gap-1.5 text-sm font-bold text-primary group/link"
                                    >
                                        Read Full Insights
                                        <ArrowRight size={16} className="transition-transform group-hover/link:translate-x-1" />
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            <div className="flex justify-center pt-2">
                <Link
                    href="/analysis-history"
                    className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-xs font-bold border border-border bg-background/50 hover:bg-accent transition-all text-muted-foreground"
                >
                    View All Market Analysis History
                </Link>
            </div>
        </div>
    );
}
