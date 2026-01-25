import { NextResponse } from 'next/server';
import { getPriceHistory } from '@/lib/api/market';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const symbol = searchParams.get('symbol') || '^GSPC';
        const rangeStr = searchParams.get('range') || '1y'; // 1y, 2y, etc.

        // Convert range string to days roughly
        let days = 365;
        if (rangeStr === '2y') days = 730;
        if (rangeStr === '5y') days = 1825;
        if (rangeStr === '10y') days = 3650;
        if (rangeStr === 'max') days = 5000;
        if (rangeStr === '6mo') days = 180;

        const data = await getPriceHistory(symbol, days);

        // Format for Lightweight Charts (time: string 'YYYY-MM-DD', value: number)
        // market.ts returns ISO string for date.
        const formatted = data.map(item => ({
            time: item.date.split('T')[0], // '2023-01-01'
            open: item.open,
            high: item.high,
            low: item.low,
            close: item.close,
            volume: item.volume
        }));

        return NextResponse.json(formatted);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
