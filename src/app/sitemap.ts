import { MetadataRoute } from 'next';
import { getAIAnalysisHistory } from '@/lib/api/ai-analysis';
import { fetchBlogPosts } from '@/lib/api/blog';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://financea.me';

    // 1. Core pages
    const routes = [
        '',
        '/markets',
        '/macro',
        '/quant',
        '/stocks/overview',
        '/sources',
        '/analysis-history',
        '/contact',
        '/about',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: route === '' ? 1.0 : 0.8,
    }));

    // 2. Fetch AI analysis posts from DB
    const aiPosts = await getAIAnalysisHistory();
    const aiPostUrls = aiPosts.map((post) => ({
        url: `${baseUrl}/blog/ai-${post.id}`,
        lastModified: post.createdAt,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
    }));

    // 3. Fetch sheet blog posts
    const sheetPosts = await fetchBlogPosts();
    const sheetPostUrls = sheetPosts.map((post) => ({
        url: `${baseUrl}/blog/${post.id}`,
        lastModified: new Date(post.time),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
    }));

    // 4. Expanded Stock list
    const stocks = [
        'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA', 'META', 'BRK.B', 'LLY', 'AVGO',
        'V', 'JPM', 'UNH', 'MA', 'WMT', 'XOM', 'HD', 'PG', 'COST', 'ORCL'
    ];

    const stockUrls = stocks.map((symbol) => ({
        url: `${baseUrl}/stocks/${symbol}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.6,
    }));

    return [...routes, ...aiPostUrls, ...sheetPostUrls, ...stockUrls];
}
