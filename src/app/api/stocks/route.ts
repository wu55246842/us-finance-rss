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

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q')?.toUpperCase() || '';

        // If no query, return empty list to save bandwidth (or return popular ones)
        if (!query) {
            return NextResponse.json([]);
        }

        const response = await fetch('https://raw.githubusercontent.com/rreichel3/US-Stock-Symbols/main/all/all_tickers.json', {
            next: { revalidate: 86400 }, // Cache upstream for 24 hours
        });

        if (!response.ok) {
            throw new Error('Failed to fetch stock tickers');
        }

        const data: TickerData[] = await response.json();

        // Server-side filtering
        const filtered = data
            .filter(item =>
                (item.symbol?.startsWith(query)) ||
                (item.name?.toUpperCase().includes(query))
            )
            .slice(0, 50) // Limit to 50 results
            .map(item => ({
                symbol: item.symbol,
                name: item.name,
            }));

        return NextResponse.json(filtered);
    } catch (error) {
        console.error('Error fetching stock tickers:', error);
        return NextResponse.json({ error: 'Failed to fetch stock tickers' }, { status: 500 });
    }
}
