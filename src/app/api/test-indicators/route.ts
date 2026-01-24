import { NextResponse } from 'next/server';

export async function GET() {
    const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;
    const symbol = 'GSPC';
    // Last 200 days approx
    const to = Math.floor(Date.now() / 1000);
    const from = to - (300 * 24 * 60 * 60);

    const url = `https://finnhub.io/api/v1/stock/candle?symbol=${symbol}&resolution=D&from=${from}&to=${to}&token=${FINNHUB_API_KEY}`;

    try {
        const res = await fetch(url);
        const data = await res.json();

        return NextResponse.json({
            status: res.status,
            dataSummary: data.s === 'ok' ? `Got ${data.c.length} candles` : 'Failed',
            lastClose: data.c ? data.c[data.c.length - 1] : null
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
