'use server';

const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';
const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;

export interface MarketQuote {
    symbol: string;
    label: string;
    currentPrice: number;
    change: number;
    percentChange: number;
}

const TICKER_CONFIG = [
    { symbol: 'SPY', label: 'S&P 500' },
    { symbol: 'TLT', label: 'Treasury' },
    { symbol: 'VXX', label: 'VIX Proxy' },
    { symbol: 'UUP', label: 'USD Index' },
    { symbol: 'QQQ', label: 'Nasdaq 100' },
];

export async function getMarketIndices(): Promise<MarketQuote[]> {
    if (!FINNHUB_API_KEY) {
        console.error('FINNHUB_API_KEY is not configured');
        return [];
    }

    try {
        const quotes = await Promise.all(
            TICKER_CONFIG.map(async (config) => {
                const url = `${FINNHUB_BASE_URL}/quote?symbol=${encodeURIComponent(config.symbol)}&token=${FINNHUB_API_KEY}`;
                const res = await fetch(url, { next: { revalidate: 60 } }); // Revalidate every minute

                if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

                const data = await res.json();

                return {
                    symbol: config.symbol,
                    label: config.label,
                    currentPrice: data.c || 0,
                    change: data.d || 0,
                    percentChange: data.dp || 0,
                };
            })
        );
        return quotes;
    } catch (error) {
        console.error('Error fetching market indices:', error);
        return [];
    }
}
