'use client';

import { useState, useMemo } from 'react';
import { Article, Category } from '@/lib/types';
import { ArticleCard } from './ui/ArticleCard';
import { EmptyState } from './ui/EmptyState';
import { AdPlaceholder } from './AdPlaceholder';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { Search } from 'lucide-react';

interface FeedContainerProps {
    initialArticles: Article[];
    defaultTab?: 'all' | Category;
    showTabs?: boolean;
    searchQuery?: string; // Controlled search query from parent (Hero)
}

export function FeedContainer({ initialArticles, defaultTab = 'all', showTabs = true, searchQuery: externalSearchQuery }: FeedContainerProps) {
    const [internalSearchQuery, setInternalSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState<'all' | Category>(defaultTab);

    // Use external query if provided, otherwise internal
    const searchQuery = externalSearchQuery !== undefined ? externalSearchQuery : internalSearchQuery;

    const filteredArticles = useMemo(() => {
        let articles = initialArticles;

        // Filter by tab
        if (activeTab !== 'all') {
            articles = articles.filter((a) => a.category === activeTab);
        }

        // Filter by search
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            articles = articles.filter(
                (a) =>
                    a.title.toLowerCase().includes(query) ||
                    a.sourceName.toLowerCase().includes(query) ||
                    (a.summary && a.summary.toLowerCase().includes(query))
            );
        }

        return articles;
    }, [initialArticles, activeTab, searchQuery]);

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        'itemListElement': filteredArticles.slice(0, 10).map((article, index) => ({
            '@type': 'ListItem',
            'position': index + 1,
            'url': article.link,
            'name': article.title,
        })),
    };

    return (
        <div className="space-y-8">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                {showTabs ? (
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                        {(['all', 'markets', 'macro', 'official'] as const).map((tab) => (
                            <button
                                key={`tab-${tab}`}
                                onClick={() => setActiveTab(tab)}
                                className={clsx(
                                    'relative whitespace-nowrap rounded-full px-5 py-2 text-sm font-medium transition-all',
                                    activeTab === tab
                                        ? 'text-primary-foreground'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                                )}
                            >
                                {activeTab === tab && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute inset-0 rounded-full bg-primary"
                                        transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                                <span className="relative z-10">{tab.charAt(0).toUpperCase() + tab.slice(1)}</span>
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="text-lg font-semibold text-muted-foreground">
                        {filteredArticles.length} Articles Found
                    </div>
                )}

                {/* Internal Search Bar (only if external is not used) */}
                {externalSearchQuery === undefined && (
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search articles..."
                            value={internalSearchQuery}
                            onChange={(e) => setInternalSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 rounded-full border border-border bg-background shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                        />
                    </div>
                )}
            </div>

            <AdPlaceholder size="banner" className="w-full rounded-xl overflow-hidden shadow-sm" />

            {filteredArticles.length === 0 ? (
                <EmptyState message="Try adjusting your search or category filter." />
            ) : (
                <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {filteredArticles.map((article, index) => (
                        <div key={`article-${article.id}-${index}`}>
                            <ArticleCard article={article} index={index} />
                            {/* Insert Ad every 6 items */}
                            {(index + 1) % 6 === 0 && (
                                <div className="col-span-full mt-6 mb-6">
                                    <AdPlaceholder size="banner" className="w-full rounded-xl overflow-hidden shadow-sm" />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            <div className="mt-12">
                <AdPlaceholder size="banner" className="w-full rounded-xl overflow-hidden shadow-sm" />
            </div>
        </div>
    );
}
