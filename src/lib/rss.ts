import Parser from 'rss-parser';
import { Article, Source, Category } from './types';
import { RSS_SOURCES } from './sources';


const parser = new Parser();

// Bypass SSL certificate validation for local development/builds if needed
// This is required for some corporate environments or specific network setups
if (process.env.NODE_TLS_REJECT_UNAUTHORIZED === undefined) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

// Cache revalidation time in seconds (5 minutes)
export const REVALIDATE_TIME = 300;

export async function fetchFeed(source: Source): Promise<Article[]> {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

        const response = await fetch(source.url, {
            next: { revalidate: REVALIDATE_TIME },
            signal: controller.signal,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
            }
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            console.error(`Error fetching ${source.name}: ${response.statusText}`);
            return [];
        }

        const xml = await response.text();
        const feed = await parser.parseString(xml);

        return feed.items.map((item) => ({
            id: `${source.id}-${item.guid || item.link || Math.random().toString(36).substring(7)}`,
            title: item.title || 'No Title',
            link: item.link || '',
            sourceId: source.id,
            sourceName: source.name,
            category: source.category,
            publishedAt: item.pubDate || item.isoDate || new Date().toISOString(),
            summary: item.contentSnippet || item.content || '',
        }));
    } catch (error) {
        console.error(`Error fetching RSS from ${source.name}:`, error);
        return [];
    }
}

export async function getFeedsByCategory(category?: Category): Promise<Article[]> {
    const sources = category
        ? RSS_SOURCES.filter((s) => s.category === category)
        : RSS_SOURCES;

    const feedPromises = sources.map((source) => fetchFeed(source));
    const results = await Promise.all(feedPromises);

    // Flatten and sort by date (newest first)
    const allArticles = results.flat().sort((a, b) => {
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    });

    // Deduplicate by ID to prevent React key collisions
    const seenIds = new Set<string>();
    const uniqueArticles: Article[] = [];
    for (const article of allArticles) {
        if (!seenIds.has(article.id)) {
            seenIds.add(article.id);
            uniqueArticles.push(article);
        }
    }

    return uniqueArticles;
}

export async function getAllFeeds(): Promise<Article[]> {
    return getFeedsByCategory();
}
