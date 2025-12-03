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
        <div className="space-y-8">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Macro Economy & Policy</h1>
                <p className="text-muted-foreground">
                    Economic data, Federal Reserve updates, and government reports.
                </p>
            </div>

            <FeedContainer initialArticles={allArticles} defaultTab="macro" showTabs={false} />
        </div>
    );
}
