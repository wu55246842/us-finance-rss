import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'AI Trading Agents | Multi-Agent Financial Analysis',
    description: 'Institutional-grade stock market analysis powered by a multi-agent AI system. Get technical, fundamental, and sentiment analysis with synthesized investment memos.',
    keywords: ['AI trading', 'stock analysis', 'multi-agent system', 'investment research', 'technical analysis', 'fundamental analysis'],
    openGraph: {
        title: 'AI Trading Agents - Deep Market Research',
        description: 'Automated institutional-grade investment research powered by AI.',
        type: 'website',
    }
};

export default function AgentsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
