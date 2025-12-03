'use client';

import { Article } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';
import { ExternalLink, Calendar, Tag } from 'lucide-react';
import { clsx } from 'clsx';

interface ArticleCardProps {
    article: Article;
    index: number;
}

export function ArticleCard({ article, index }: ArticleCardProps) {
    return (
        <motion.a
            href={article.link}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-lg hover:border-primary/20 hover:-translate-y-1"
        >
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary/5 opacity-0 transition-opacity group-hover:opacity-100" />

            <div className="relative z-10 space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className={clsx(
                            "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
                            article.category === 'markets'
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                                : article.category === 'macro'
                                    ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
                                    : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300"
                        )}>
                            {article.sourceName}
                        </span>
                    </div>
                    <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                </div>

                <h3 className="font-bold text-lg leading-tight tracking-tight group-hover:text-primary transition-colors line-clamp-2">
                    {article.title}
                </h3>

                <p className="text-sm text-muted-foreground line-clamp-3">
                    {(article.summary || '').replace(/<[^>]*>/g, '').slice(0, 150)}...
                </p>
            </div>

            <div className="relative z-10 mt-6 flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                <time dateTime={article.publishedAt}>
                    {formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })}
                </time>
            </div>
        </motion.a>
    );
}
