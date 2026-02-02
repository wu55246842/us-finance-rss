import { promises as fs } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

// Interface for the ticker data structure from the source
interface TickerData {
    symbol: string;
    name: string;
}

let cachedTickers: TickerData[] | null = null;

function parseTickerLine(line: string): TickerData | null {
    const trimmed = line.trim();
    if (!trimmed) return null;

    const pipeParts = trimmed.split('|');
    if (pipeParts.length >= 2) {
        return { symbol: pipeParts[0].toUpperCase(), name: pipeParts[1].trim() };
    }

    const tabParts = trimmed.split('\t');
    if (tabParts.length >= 2) {
        return { symbol: tabParts[0].toUpperCase(), name: tabParts[1].trim() };
    }

    return { symbol: trimmed.toUpperCase(), name: trimmed };
}

async function loadTickers(): Promise<TickerData[]> {
    if (cachedTickers) return cachedTickers;

    const filePath = path.join(process.cwd(), 'src', 'data', 'all_tickers.txt');
    const fileContents = await fs.readFile(filePath, 'utf8');
    cachedTickers = fileContents
        .split(/\r?\n/)
        .map(parseTickerLine)
        .filter((item): item is TickerData => Boolean(item));

    return cachedTickers;
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q')?.toUpperCase() || '';

        // If no query, return empty list to save bandwidth (or return popular ones)
        if (!query) {
            return NextResponse.json([]);
        }

        const data = await loadTickers();

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
        return NextResponse.json([], { status: 200 });
    }
}
