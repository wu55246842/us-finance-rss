const pkg = require('yahoo-finance2');

function getYf() {
    // In some environments, pkg itself is the instance.
    // In others, pkg.default is the instance.
    // In some (like rare ESM/CJS mixes), we might get the Class and need to instantiate.

    let instance = pkg.default || pkg;

    // Check if it looks like the instance (has quote function)
    if (instance && typeof instance.quote === 'function') {
        return instance;
    }

    // If not, maybe it's the module with named exports? 
    // Or maybe we need to find the class?
    // Based on logs, we saw keys like ['autoc', ... 'quote']. 
    // If 'quote' is there but not a function, or if suppressNotices is missing, it's ambiguous.

    // Let's try to find a 'default' property that might be the instance recursively
    if (instance && instance.default && typeof instance.default.quote === 'function') {
        return instance.default;
    }

    console.warn('YahooFinance import ambiguous, using best guess:', Object.keys(instance || {}));
    return instance;
}

const yf = getYf();

// Safeguard suppressNotices
if (yf && typeof yf.suppressNotices === 'function') {
    yf.suppressNotices(['yahooSurvey']);
} else {
    // Try to suppress via other means or ignore
    console.log('yf.suppressNotices not found/function');
}

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
    { symbol: '^VIX', displaySymbol: 'VXX', label: 'VIX Proxy' }, // Yahoo uses ^VIX, app uses VXX
    { symbol: 'UUP', label: 'USD Index' },
    { symbol: 'QQQ', label: 'Nasdaq 100' },
];

export async function getMarketIndices(): Promise<MarketQuote[]> {
    try {
        const quotes = await Promise.all(
            TICKER_CONFIG.map(async (config) => {
                try {
                    const quote = await yf.quote(config.symbol);
                    return {
                        symbol: config.displaySymbol || config.symbol,
                        label: config.label,
                        currentPrice: quote.regularMarketPrice || 0,
                        change: quote.regularMarketChange || 0,
                        percentChange: quote.regularMarketChangePercent || 0,
                    };
                } catch (e) {
                    console.error(`Failed to fetch quote for ${config.symbol}`, e);
                    // Return empty/zero object on failure to avoid breaking the whole page
                    return {
                        symbol: config.displaySymbol || config.symbol,
                        label: config.label,
                        currentPrice: 0,
                        change: 0,
                        percentChange: 0
                    };
                }
            })
        );
        return quotes;
    } catch (error) {
        console.error('Error fetching market indices from Yahoo:', error);
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
    try {
        // Fetch 365 days of data to ensure enough for SMA200
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - 400); // 400 days ago to be safe for trading days

        const queryOptions = { period1: start, period2: end, interval: '1d' as const };

        let result: any[] = [];
        try {
            result = await yf.historical(symbol, queryOptions);
        } catch (e) {
            console.error(`Failed to fetch history for ${symbol}`, e);
            return null;
        }

        // Extract close prices, result is sorted by date ascending usually, but ensure it.
        // Yahoo returns newest last.
        const closes = result.map((quote: any) => quote.close).filter((c: any): c is number => typeof c === 'number');

        if (closes.length < 200) {
            console.warn(`Not enough data for ${symbol} technicals. Got ${closes.length} points.`);
            return null;
        }

        return {
            rsi: calculateRSI(closes, 14),
            sma10: calculateSMA(closes, 10),
            sma50: calculateSMA(closes, 50),
            sma200: calculateSMA(closes, 200),
        };
    } catch (error) {
        console.error(`Error fetching technicals for ${symbol} from Yahoo:`, error);
        return null;
    }
}

// --- Helper Functions ---

function calculateSMA(data: number[], period: number): number {
    if (data.length < period) return 0;
    const slice = data.slice(-period);
    const sum = slice.reduce((a, b) => a + b, 0);
    return sum / period;
}

function calculateRSI(data: number[], period: number): number {
    if (data.length < period + 1) return 0;

    const changes = [];
    for (let i = 1; i < data.length; i++) {
        changes.push(data[i] - data[i - 1]);
    }

    if (changes.length < period) return 0;

    // First RSI
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
        let currentGain = 0;
        let currentLoss = 0;
        if (chg > 0) currentGain = chg;
        else currentLoss = Math.abs(chg);

        avgGain = ((avgGain * (period - 1)) + currentGain) / period;
        avgLoss = ((avgLoss * (period - 1)) + currentLoss) / period;
    }

    if (avgLoss === 0) return 100;
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
}
