import { BlogPost } from '@/lib/types/blog';

const MOCK_BLOG_POSTS: BlogPost[] = [
    {
        id: '1',
        time: new Date().toISOString(),
        title: 'Market Analysis: The Fed\'s Next Move',
        content: 'In this comprehensive analysis, we explore the potential outcomes of the upcoming FOMC meeting and what it means for equity markets. Inflation data has been mixed, leading to increased volatility...',
        resources: ['https://www.federalreserve.gov', 'https://www.bloomberg.com/markets'],
        youtubeLink: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    },
    {
        id: '2',
        time: new Date(Date.now() - 86400000).toISOString(),
        title: 'Tech Stocks: Is the Rally Over?',
        content: 'We take a deep dive into the technicals of the Nasdaq 100. With valuations stretching to historic highs, are we due for a correction, or is the AI-driven boom just getting started?',
        resources: ['https://finance.yahoo.com'],
        youtubeLink: '',
    },
    {
        id: '3',
        time: new Date(Date.now() - 172800000).toISOString(),
        title: 'Understanding Yield Curves',
        content: 'A beginner\'s guide to understanding what the bond market is predicting about the economy. The inverted yield curve has historically been a reliable recession indicator...',
        resources: [],
    }
];

export async function fetchBlogPosts(): Promise<BlogPost[]> {
    // const res = await fetch(process.env.BLOG_API_URL || 'https://wu55246842.app.n8n.cloud/webhook/ai-news-digest');
    // if (!res.ok) throw new Error('Failed to fetch posts');
    // console.log(res.json());
    // return res.json();

    // Simulating network delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    return MOCK_BLOG_POSTS;
}
