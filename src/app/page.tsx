import { getAllFeeds } from '@/lib/rss';
import { HomeContent } from '@/components/HomeContent';
import { getLatestAIAnalysis } from '@/lib/api/ai-analysis';
import { getMarketIndices } from '@/lib/api/market';

export const revalidate = 300;

export default async function Home() {
  const [articles, latestAIAnalysis, marketQuotes] = await Promise.all([
    getAllFeeds(),
    getLatestAIAnalysis(),
    getMarketIndices()
  ]);

  return (
    <HomeContent
      initialArticles={articles}
      latestAnalysis={latestAIAnalysis}
      marketQuotes={marketQuotes}
    />
  );
}
