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

export interface TechnicalIndicators {
    rsi: number;
    sma10: number;
    sma50: number;
    sma200: number;
}

export async function getTechnicalIndicators(symbol: string): Promise<TechnicalIndicators | null> {
    if (!FINNHUB_API_KEY) return null;

    try {
        const indicators = ['rsi', 'sma'];
        const resolutions = ['D'];

        // Helper to fetch indicator
        const fetchIndicator = async (indicator: string, timeperiod: number) => {
            const url = `${FINNHUB_BASE_URL}/indicator?symbol=${symbol}&resolution=D&indicator=${indicator}&timeperiod=${timeperiod}&token=${FINNHUB_API_KEY}`;
            const res = await fetch(url);
            if (!res.ok) return null;
            const data = await res.json();
            return data.o && data.o.length > 0 ? data.o[data.o.length - 1] : null;
        };

        const [rsi, sma10, sma50, sma200] = await Promise.all([
            fetchIndicator('rsi', 14),
            fetchIndicator('sma', 10),
            fetchIndicator('sma', 50),
            fetchIndicator('sma', 200),
        ]);

        return {
            rsi: rsi || 0,
            sma10: sma10 || 0,
            sma50: sma50 || 0,
            sma200: sma200 || 0,
        };
    } catch (error) {
        console.error(`Error fetching indicators for ${symbol}:`, error);
        return null;
    }
}

export async function getMarketNews(symbol: string): Promise<string[]> {
    if (!FINNHUB_API_KEY) return [];

    try {
        const today = new Date().toISOString().split('T')[0];
        const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        const url = `${FINNHUB_BASE_URL}/company-news?symbol=${symbol}&from=${lastWeek}&to=${today}&token=${FINNHUB_API_KEY}`;
        const res = await fetch(url);
        if (!res.ok) return [];
        const data = await res.json();

        return data.slice(0, 5).map((item: any) => item.headline);
    } catch (error) {
        console.error(`Error fetching news for ${symbol}:`, error);
        return [];
    }
}
