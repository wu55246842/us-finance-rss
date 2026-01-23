import YahooFinance from "yahoo-finance2";

const yahooFinance = new YahooFinance({
    // Optional: avoid rate limiting
    queue: { concurrency: 2 },
});

// Optional: check if function exists (safe navigation)
// if (typeof yahooFinance.suppressNotices === 'function') {
//     yahooFinance.suppressNotices(["yahooSurvey"]);
// }

export interface MarketQuote {
    symbol: string;
    label: string;
    currentPrice: number;
    change: number;
    percentChange: number;
}

const TICKER_CONFIG = [
    { symbol: "SPY", label: "S&P 500" },
    { symbol: "TLT", label: "Treasury" },
    { symbol: "^VIX", displaySymbol: "VXX", label: "VIX Proxy" },
    { symbol: "UUP", label: "USD Index" },
    { symbol: "QQQ", label: "Nasdaq 100" },
];

export async function getMarketIndices(): Promise<MarketQuote[]> {
    const quotes = await Promise.all(
        TICKER_CONFIG.map(async (config) => {
            try {
                const quote = await yahooFinance.quote(config.symbol);
                return {
                    symbol: config.displaySymbol || config.symbol,
                    label: config.label,
                    currentPrice: quote.regularMarketPrice ?? 0,
                    change: quote.regularMarketChange ?? 0,
                    percentChange: quote.regularMarketChangePercent ?? 0,
                };
            } catch (e) {
                console.error(`Failed to fetch quote for ${config.symbol}`, e);
                return {
                    symbol: config.displaySymbol || config.symbol,
                    label: config.label,
                    currentPrice: 0,
                    change: 0,
                    percentChange: 0,
                };
            }
        })
    );

    return quotes;
}

export interface TechnicalIndicators {
    rsi: number;
    sma10: number;
    sma50: number;
    sma200: number;
}

export async function getTechnicalIndicators(symbol: string): Promise<TechnicalIndicators | null> {
    try {
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - 400);

        const result = await yahooFinance.historical(symbol, {
            period1: start,
            period2: end,
            interval: "1d",
        });

        const closes = result
            .map((q: any) => q.close)
            .filter((c: any): c is number => typeof c === "number");

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

// --- Helper Functions ---
function calculateSMA(data: number[], period: number): number {
    if (data.length < period) return 0;
    const slice = data.slice(-period);
    const sum = slice.reduce((a, b) => a + b, 0);
    return sum / period;
}

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
