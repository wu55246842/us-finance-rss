'use client';

import { useState, useMemo } from 'react';
import { Article, Category } from '@/lib/types';
import { ArticleCard } from './ArticleCard';
import { SearchBar } from './SearchBar';
import { AdPlaceholder } from './AdPlaceholder';
import { clsx } from 'clsx';

interface FeedContainerProps {
    initialArticles: Article[];
    defaultTab?: 'all' | Category;
    showTabs?: boolean;
}

export function FeedContainer({ initialArticles, defaultTab = 'all', showTabs = true }: FeedContainerProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState<'all' | Category>(defaultTab);

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

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                {showTabs ? (
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                        {(['all', 'markets', 'macro', 'official'] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={clsx(
                                    'whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-all',
                                    activeTab === tab
                                        ? 'bg-primary text-primary-foreground shadow-sm'
                                        : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                                )}
                            >
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="text-lg font-semibold text-muted-foreground">
                        {initialArticles.length} Articles Found
                    </div>
                )}

                <SearchBar value={searchQuery} onChange={setSearchQuery} />
            </div>

            <AdPlaceholder size="banner" className="w-full" />

            {filteredArticles.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                    <p className="text-lg">No articles found.</p>
                    <p className="text-sm">Try adjusting your search or category.</p>
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {filteredArticles.map((article, index) => (
                        <>
                            <ArticleCard key={article.id} article={article} />
                            {/* Insert Ad every 6 items */}
                            {(index + 1) % 6 === 0 && (
                                <div className="col-span-full">
                                    <AdPlaceholder size="banner" className="w-full" />
                                </div>
                            )}
                        </>
                    ))}
                </div>
            )}

            <div className="mt-8">
                <AdPlaceholder size="banner" className="w-full" />
            </div>
        </div>
    );
}
