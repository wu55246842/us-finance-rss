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
            <div className="space-y-4 py-8 text-center md:text-left">
                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-400 dark:to-cyan-300">
                    US Stock Markets
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl">
                    Real-time coverage of major indices and individual stock movements from top financial sources.
                </p>
            </div>

            <FeedContainer initialArticles={articles} defaultTab="markets" showTabs={false} />
        </div>
    );
}
