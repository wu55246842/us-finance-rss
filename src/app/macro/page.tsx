import { getFeedsByCategory } from '@/lib/rss';
import { FeedContainer } from '@/components/FeedContainer';

export const revalidate = 300;

export const metadata = {
    title: 'Macro Economy & Fed News - US Markets & Macro Hub',
    description: 'Updates on US economy, inflation, employment, and Federal Reserve policy.',
};

export default async function MacroPage() {
    const articles = await getFeedsByCategory('macro');
    // Also fetch official sources for this page as they are related
    const officialArticles = await getFeedsByCategory('official');

    // Combine and sort
    const allArticles = [...articles, ...officialArticles].sort((a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );

    return (
        <div className="space-y-8 px-4 md:px-6 max-w-7xl mx-auto">
            <div className="space-y-4 py-8 text-center md:text-left">
                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-500 dark:from-purple-400 dark:to-pink-300">
                    Macro Economy & Policy
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl">
                    Deep dive into economic indicators, Federal Reserve decisions, and government data releases.
                </p>
            </div>

            <FeedContainer initialArticles={allArticles} defaultTab="macro" showTabs={false} />
        </div>
    );
}
