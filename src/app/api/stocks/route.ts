import { NextResponse } from 'next/server';

// Interface for the ticker data structure from the source
interface TickerData {
    symbol: string;
    name: string;
    exchange: string;
    assetType: string;
    ipoDate: string;
    delistingDate: string | null;
    status: string;
}

export async function GET() {
    try {
        const response = await fetch('https://raw.githubusercontent.com/rreichel3/US-Stock-Symbols/main/all/all_tickers.json', {
            next: { revalidate: 86400 }, // Cache for 24 hours
        });

        if (!response.ok) {
            throw new Error('Failed to fetch stock tickers');
        }

        const data: TickerData[] = await response.json();

        // Map to a lighter format for the frontend
        const tickers = data.map(item => ({
            symbol: item.symbol,
            name: item.name,
        }));

        return NextResponse.json(tickers);
    } catch (error) {
        console.error('Error fetching stock tickers:', error);
        return NextResponse.json({ error: 'Failed to fetch stock tickers' }, { status: 500 });
    }
}
