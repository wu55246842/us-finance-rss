import { NextResponse } from 'next/server';
import { getPriceHistory } from '@/lib/api/market';

export async function POST(req: Request) {
    try {
        const { code, symbol = '^GSPC' } = await req.json();

        if (!code || typeof code !== 'string') {
            return NextResponse.json({ error: 'Invalid code provided' }, { status: 400 });
        }

        // 1. Fetch Historical Data (Last 2 years ~ 500 bars)
        // using our internal market function
        const history = await getPriceHistory(symbol, 500);

        if (history.length === 0) {
            return NextResponse.json({ error: 'No historical data found' }, { status: 404 });
        }

        // 2. Prepare Results
        const markers: any[] = [];
        let position = 0; // 0 = flat, 1 = long
        let balance = 10000;
        const trades = [];

        // 3. Execute User Code Bar-by-Bar
        // We wrap the user code in a function
        // User code expects 'bar' or 'stock' context.
        // Let's provide 'bar' { close, open, high, low, volume, rsi... }
        // For simplicity, we just provide price data roughly. 
        // Ideally we would calc indicators here too.

        // We'll create a simple function wrapper
        const strategyFn = new Function('bar', 'position', `
            try {
                ${code}
            } catch (e) { return null; }
        `);

        for (const bar of history) {
            // Simplified context
            const context = {
                price: bar.close,
                open: bar.open,
                high: bar.high,
                low: bar.low,
                volume: bar.volume,
                // We could add simple indicators here if we had a library
            };

            // Execute
            const signal = strategyFn(context, position);
            // Expected return: 'BUY', 'SELL', 'HOLD' (or nothing)

            const dateStr = bar.date.split('T')[0];

            if (signal === 'BUY' && position === 0) {
                position = 1;
                markers.push({
                    time: dateStr,
                    position: 'belowBar',
                    color: '#2196F3',
                    shape: 'arrowUp',
                    text: 'BUY @ ' + bar.close.toFixed(0)
                });
            } else if (signal === 'SELL' && position === 1) {
                position = 0;
                markers.push({
                    time: dateStr,
                    position: 'aboveBar',
                    color: '#E91E63',
                    shape: 'arrowDown',
                    text: 'SELL @ ' + bar.close.toFixed(0)
                });
            }
        }

        return NextResponse.json({ markers, success: true });

    } catch (error: any) {
        console.error('Backtest Error:', error);
        return NextResponse.json({ error: 'Backtest failed: ' + error.message }, { status: 500 });
    }
}
