import { getFeedsByCategory } from '@/lib/rss';
import { FeedContainer } from '@/components/FeedContainer';

export const revalidate = 300;

export const metadata = {
    title: 'US Stock Markets News - US Markets & Macro Hub',
    description: 'Latest news on S&P 500, Nasdaq, Dow Jones, and individual stocks.',
};

export default async function MarketsPage() {
    const articles = await getFeedsByCategory('markets');

    return (
        <div className="space-y-8">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">US Stock Markets</h1>
                <p className="text-muted-foreground">
                    Latest updates from Yahoo Finance, CNBC, and MarketWatch.
                </p>
            </div>

            <FeedContainer initialArticles={articles} defaultTab="markets" showTabs={false} />
        </div>
    );
}
