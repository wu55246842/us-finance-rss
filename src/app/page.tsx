import { getAllFeeds } from '@/lib/rss';
import { FeedContainer } from '@/components/FeedContainer';

export const revalidate = 300;

export default async function Home() {
  const articles = await getAllFeeds();

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2 py-8">
        <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
          US Markets & Macro Hub
        </h1>
        <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
          Aggregating the latest news on US stocks, economy, and Federal Reserve policy.
        </p>
      </div>

      <FeedContainer initialArticles={articles} />
    </div>
  );
}
