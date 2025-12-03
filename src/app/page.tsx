import { getAllFeeds } from '@/lib/rss';
import { HomeContent } from '@/components/HomeContent';

export const revalidate = 300;

export default async function Home() {
  const articles = await getAllFeeds();

  return <HomeContent initialArticles={articles} />;
}
