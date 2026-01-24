'use server';

const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';
const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;

const YAHOO_CHART_BASE = 'https://query2.finance.yahoo.com/v8/finance/chart';

export interface MarketQuote {
    symbol: string;
    label: string;
    currentPrice: number;
    change: number;
    percentChange: number;
}

const TICKER_CONFIG: Array<{ symbol: string; displaySymbol?: string; label: string }> = [
    { symbol: '^GSPC', displaySymbol: 'SPX500', label: 'S&P 500 Index' },
    { symbol: 'TLT', label: 'Treasury (ETF)' },
    { symbol: '^VIX', displaySymbol: 'VIX', label: 'VIX' },
    { symbol: 'DX-Y.NYB', displaySymbol: 'DXY', label: 'US Dollar Index' },
    { symbol: '^NDX', displaySymbol: 'NDX', label: 'Nasdaq 100 Index' },
];

type YahooChartResp = {
    chart?: {
        result?: Array<{
            timestamp?: number[];
            indicators?: {
                quote?: Array<{
                    close?: Array<number | null>;
                    open?: Array<number | null>;
                    high?: Array<number | null>;
                    low?: Array<number | null>;
                    volume?: Array<number | null>;
                }>;
            };
            meta?: any;
        }>;
        error?: any;
    };
};

function lastTwoValid(closes: Array<number | null> | undefined): { last?: number; prev?: number } {
    if (!closes || closes.length === 0) return {};
    const valid = closes.filter((x): x is number => typeof x === 'number' && Number.isFinite(x));
    if (valid.length === 0) return {};
    const last = valid[valid.length - 1];
    const prev = valid.length >= 2 ? valid[valid.length - 2] : undefined;
    return { last, prev };
}

async function fetchChart(symbol: string, range = '5d', interval = '1d'): Promise<YahooChartResp> {
    const url = `${YAHOO_CHART_BASE}/${encodeURIComponent(symbol)}?range=${encodeURIComponent(
        range
    )}&interval=${encodeURIComponent(interval)}`;

    // 关键：Next.js server 侧加 UA，减少被当作 bot
    const res = await fetch(url, {
        headers: {
            'user-agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36',
            accept: 'application/json,text/plain,*/*',
        },
        next: { revalidate: 60 },
    });

    if (!res.ok) throw new Error(`Yahoo chart HTTP ${res.status} for ${symbol}`);
    return (await res.json()) as YahooChartResp;
}

export async function getMarketIndices(): Promise<MarketQuote[]> {
    const quotes = await Promise.all(
        TICKER_CONFIG.map(async (cfg) => {
            try {
                const data = await fetchChart(cfg.symbol, '5d', '1d');

                const r0 = data.chart?.result?.[0];
                const closes = r0?.indicators?.quote?.[0]?.close;

                const { last, prev } = lastTwoValid(closes);

                const currentPrice = last ?? 0;
                const change = last != null && prev != null ? last - prev : 0;
                const percentChange = last != null && prev != null && prev !== 0 ? (change / prev) * 100 : 0;

                return {
                    symbol: cfg.displaySymbol || cfg.symbol,
                    label: cfg.label,
                    currentPrice,
                    change,
                    percentChange,
                };
            } catch (e) {
                console.error(`Failed to fetch quote for ${cfg.symbol}`, e);
                return {
                    symbol: cfg.displaySymbol || cfg.symbol,
                    label: cfg.label,
                    currentPrice: 0,
                    change: 0,
                    percentChange: 0,
                };
            }
        })
    );

    return quotes;
}

// --------------------
// Indicators (RSI/SMA) using chart history
// --------------------

export interface TechnicalIndicators {
    rsi: number;
    sma10: number;
    sma50: number;
    sma200: number;
}

function calculateSMA(data: number[], period: number): number {
    if (data.length < period) return 0;
    const slice = data.slice(-period);
    const sum = slice.reduce((a, b) => a + b, 0);
    return sum / period;
}

// Wilder RSI (与你 TS 一致)
function calculateRSI(data: number[], period: number): number {
    if (data.length < period + 1) return 0;

    const changes: number[] = [];
    for (let i = 1; i < data.length; i++) changes.push(data[i] - data[i - 1]);

    let avgGain = 0;
    let avgLoss = 0;

    for (let i = 0; i < period; i++) {
        const chg = changes[i];
        if (chg > 0) avgGain += chg;
        else avgLoss += Math.abs(chg);
    }

    avgGain /= period;
    avgLoss /= period;

    for (let i = period; i < changes.length; i++) {
        const chg = changes[i];
        const gain = chg > 0 ? chg : 0;
        const loss = chg < 0 ? Math.abs(chg) : 0;

        avgGain = (avgGain * (period - 1) + gain) / period;
        avgLoss = (avgLoss * (period - 1) + loss) / period;
    }

    if (avgLoss === 0) return 100;
    const rs = avgGain / avgLoss;
    return 100 - 100 / (1 + rs);
}

export async function getTechnicalIndicators(symbol: string): Promise<TechnicalIndicators | null> {
    try {
        // chart 支持的 range 是 1mo/3mo/6mo/1y/2y/5y/10y/ytd/max
        // SMA200 + RSI14，建议用 1y 或 2y 更保险（1y ≈ 252 交易日）
        const data = await fetchChart(symbol, '2y', '1d');

        const r0 = data.chart?.result?.[0];
        const closesRaw = r0?.indicators?.quote?.[0]?.close || [];
        const closes = closesRaw.filter((x): x is number => typeof x === 'number' && Number.isFinite(x));

        if (closes.length < 200) return null;

        return {
            rsi: calculateRSI(closes, 14),
            sma10: calculateSMA(closes, 10),
            sma50: calculateSMA(closes, 50),
            sma200: calculateSMA(closes, 200),
        };
    } catch (e) {
        console.error(`Error fetching technicals for ${symbol}:`, e);
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

export type CompanyProfile = {
    profile: any;  // 你也可以强类型化
    metrics: any;
};

export async function getCompanyProfile(symbol: string): Promise<CompanyProfile | null> {
    if (!FINNHUB_API_KEY) {
        console.error('FINNHUB_API_KEY is not configured');
        return null;
    }

    try {
        const profileUrl = `${FINNHUB_BASE_URL}/stock/profile2?symbol=${encodeURIComponent(symbol)}&token=${FINNHUB_API_KEY}`;
        const metricUrl = `${FINNHUB_BASE_URL}/stock/metric?symbol=${encodeURIComponent(symbol)}&metric=all&token=${FINNHUB_API_KEY}`;

        const pRes = await fetch(profileUrl, { next: { revalidate: 3600 } }) // 1h cache
        const mRes = await fetch(metricUrl, { next: { revalidate: 3600 } })

        if (!pRes.ok) throw new Error(`Profile HTTP ${pRes.status}`);
        if (!mRes.ok) throw new Error(`Metric HTTP ${mRes.status}`);

        const [profile, metrics] = await Promise.all([pRes.json(), mRes.json()]);

        return { profile, metrics };
    } catch (e) {
        console.error(`Error fetching profile for ${symbol} via Finnhub:`, e);
        return null;
    }
}



export type PriceBar = {
    date: string;   // ISO
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
};

function daysToYahooRange(days: number): string {
    if (days <= 7) return '7d';
    if (days <= 30) return '1mo';
    if (days <= 90) return '3mo';
    if (days <= 180) return '6mo';
    if (days <= 365) return '1y';
    if (days <= 730) return '2y';
    if (days <= 1825) return '5y';
    return '10y';
}

export async function getPriceHistory(symbol: string, days: number = 100): Promise<PriceBar[]> {
    try {
        const range = daysToYahooRange(days);
        const data = await fetchChart(symbol, range, '1d');

        const r0 = data.chart?.result?.[0];
        const ts = r0?.timestamp || [];
        const q0 = r0?.indicators?.quote?.[0];

        if (!q0 || ts.length === 0) return [];

        const { open = [], high = [], low = [], close = [], volume = [] } = q0;

        const rows: PriceBar[] = [];
        for (let i = 0; i < ts.length; i++) {
            const c = close[i];
            if (typeof c !== 'number' || !Number.isFinite(c)) continue;

            const d = new Date(ts[i] * 1000).toISOString();
            rows.push({
                date: d,
                open: typeof open[i] === 'number' ? open[i]! : 0,
                high: typeof high[i] === 'number' ? high[i]! : 0,
                low: typeof low[i] === 'number' ? low[i]! : 0,
                close: c,
                volume: typeof volume[i] === 'number' ? volume[i]! : 0,
            });
        }

        // 截断到最后 N 天（交易日近似）
        return rows.slice(-days);
    } catch (e) {
        console.error(`Error fetching history for ${symbol}:`, e);
        return [];
    }
}

