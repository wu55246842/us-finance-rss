'use client';

import { useState } from 'react';
import { Article } from '@/lib/types';
import { Hero } from '@/components/Hero';
import { FeedContainer } from '@/components/FeedContainer';

interface HomeContentProps {
    initialArticles: Article[];
}

export function HomeContent({ initialArticles }: HomeContentProps) {
    const [searchQuery, setSearchQuery] = useState('');

    return (
        <div className="space-y-8">
            <Hero onSearch={setSearchQuery} />
            <div className="container mx-auto px-4 md:px-6 max-w-7xl">
                <FeedContainer
                    initialArticles={initialArticles}
                    searchQuery={searchQuery}
                    showTabs={true}
                />
            </div>
        </div>
    );
}
