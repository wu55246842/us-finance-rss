'use client';

import { useState } from 'react';
import { Article } from '@/lib/types';
import { Hero } from '@/components/Hero';
import { FeedContainer } from '@/components/FeedContainer';

import { AIBlogHeader } from '@/components/AIBlogHeader';
import { MarketTickers } from '@/components/MarketTickers';
import { MarketQuote } from '@/lib/api/market';
import { Newsletter } from '@/components/Newsletter';
import { FeaturedSources } from '@/components/FeaturedSources';

interface HomeContentProps {
    initialArticles: Article[];
    latestAnalysis: {
        id: number;
        title: string;
        content: string;
        createdAt: Date;
    } | null;
    marketQuotes: MarketQuote[];
}

export function HomeContent({ initialArticles, latestAnalysis, marketQuotes }: HomeContentProps) {
    const [searchQuery, setSearchQuery] = useState('');

    return (
        <div className="space-y-8 pb-12">
            <Hero />
            <FeaturedSources />
            <MarketTickers quotes={marketQuotes} />
            <div className="container mx-auto px-4 md:px-6 max-w-7xl">
                <AIBlogHeader latestAnalysis={latestAnalysis} onSearch={setSearchQuery} />
                <FeedContainer
                    initialArticles={initialArticles}
                    searchQuery={searchQuery}
                    showTabs={true}
                />
                <Newsletter />
            </div>
        </div>
    );
}
