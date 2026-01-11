import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://financea.me';

    const stocks = [
        'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA', 'META', 'BRK-B', 'LLY', 'AVGO'
    ];

    const stockUrls = stocks.map((symbol) => ({
        url: `${baseUrl}/stocks/${symbol}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.8,
    }));

    const routes = [
        '',
        '/markets',
        '/macro',
        '/quant',
        '/stocks/overview',
        '/sources',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: route === '' ? 1.0 : 0.9,
    }));

    return [...routes, ...stockUrls];
}
