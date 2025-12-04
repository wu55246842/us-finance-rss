import { NextResponse } from 'next/server';
import { searchStocks } from '@/lib/openstock/finnhub';
import { fetchJSON } from '@/lib/openstock/finnhub';

// Define the context available to the user's script
interface StrategyContext {
    symbol: string;
    price: number;
    changePercent: number;
    volume: number;
    marketCap: number;
    peRatio: number | null;
}

export async function POST(req: Request) {
    try {
        const { code } = await req.json();

        if (!code || typeof code !== 'string') {
            return NextResponse.json({ error: 'Invalid code provided' }, { status: 400 });
        }

        // 1. Fetch a list of stocks to test against (e.g., Top 20 popular stocks)
        // In a real app, we might fetch all S&P 500 or allow user to specify a universe
        const universe = await searchStocks(''); // Returns top 15-20 popular stocks if query is empty

        // 2. Fetch real-time quote and profile for each stock to build context
        // We limit to 10 to avoid hitting API rate limits too hard in this demo
        const stocksToTest = universe.slice(0, 10);

        const results = [];
        const token = process.env.FINNHUB_API_KEY ?? process.env.NEXT_PUBLIC_FINNHUB_API_KEY;

        for (const stock of stocksToTest) {
            try {
                // Fetch Quote
                const quoteUrl = `https://finnhub.io/api/v1/quote?symbol=${stock.symbol}&token=${token}`;
                const quote = await fetchJSON<any>(quoteUrl);

                // Fetch Profile (for PE, MarketCap)
                const profileUrl = `https://finnhub.io/api/v1/stock/profile2?symbol=${stock.symbol}&token=${token}`;
                const profile = await fetchJSON<any>(profileUrl);

                const context: StrategyContext = {
                    symbol: stock.symbol,
                    price: quote.c || 0,
                    changePercent: quote.dp || 0,
                    volume: quote.v || 0,
                    marketCap: profile.marketCapitalization || 0,
                    peRatio: profile.shareOutstanding ? (quote.c / (profile.shareOutstanding / 1000000)) : null // Rough PE approx if not directly available, or just use what we have
                };

                // 3. Execute User Code
                // WARNING: 'new Function' is used here for demonstration. 
                // In production, use a secure sandbox like 'vm2' or 'isolated-vm'.
                // The user code should return a boolean.
                // We wrap it in a function that takes 'stock' as an argument.

                const userFunction = new Function('stock', `
                    try {
                        ${code}
                    } catch (e) {
                        return false;
                    }
                `);

                const isSelected = userFunction(context);

                if (isSelected) {
                    results.push({
                        ...stock,
                        price: context.price,
                        change: context.changePercent,
                        reason: 'Matched criteria'
                    });
                }

            } catch (e) {
                console.error(`Error processing ${stock.symbol}`, e);
            }
        }

        return NextResponse.json({ results });

    } catch (error) {
        console.error('Strategy execution error:', error);
        return NextResponse.json({ error: 'Failed to execute strategy' }, { status: 500 });
    }
}
