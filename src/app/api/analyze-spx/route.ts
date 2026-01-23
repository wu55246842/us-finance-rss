import { NextResponse } from 'next/server';
import { getMarketNews } from '@/lib/api/market';
import { getMarketIndices, getTechnicalIndicators } from '@/lib/api/yahoo';
import { generateAnalysis } from '@/lib/pollinations';
import { appendToSheet } from '@/lib/google-sheets';

export async function GET() {
    try {
        // 1. Fetch Market Data
        const indices = await getMarketIndices();
        const spx = indices.find(i => i.symbol === 'SPY'); // Using SPY as proxy for price action
        const vix = indices.find(i => i.symbol === 'VXX');
        const tnx = indices.find(i => i.symbol === 'TLT'); // Proxy or we can use another ticker
        const dxy = indices.find(i => i.symbol === 'UUP');
        const ndx = indices.find(i => i.symbol === 'QQQ');

        // 2. Fetch Technicals
        const technicals = await getTechnicalIndicators('SPY');

        // 3. Fetch News
        const news = await getMarketNews('SPY');
        const newsSummary = news.join('\n- ');

        if (!spx || !technicals) {
            return NextResponse.json({ error: 'Failed to fetch core market data' }, { status: 500 });
        }

        // 4. Construct Prompt
        const prompt = `
Generate a deep-dive analysis report for the S&P 500 (SPX).
Current Data:
- Price: ${spx.currentPrice} (${spx.percentChange}%)
- RSI(14): ${technicals.rsi.toFixed(2)}
- SMA10: ${technicals.sma10.toFixed(2)}, SMA50: ${technicals.sma50.toFixed(2)}, SMA200: ${technicals.sma200.toFixed(2)}
- VIX: ${vix?.currentPrice} (${vix?.percentChange}%)
- US 10Y (TLT): ${tnx?.currentPrice} (${tnx?.percentChange}%)
- DXY (UUP): ${dxy?.currentPrice} (${dxy?.percentChange}%)
- NDX (QQQ): ${ndx?.percentChange}% vs SPX ${spx.percentChange}%

News Headlines:
- ${newsSummary}

Analysis Framework: The "Triangular Methodology" (Macro + Technical + Micro).
Output Format: Bilingual (Chinese first, then English).
Follow the structure: 1. Executive Summary, 2. Triangular Analysis, 3. Support/Resistance, 4. Actionable Strategy, 5. Key Data Table.
`;

        // 5. Call Pollinations AI
        const analysis = await generateAnalysis({
            messages: [
                { role: 'user', content: prompt }
            ]
        });

        // 6. Log to Google Sheets
        const spreadsheetId = process.env.NEXT_PUBLIC_GOOGLE_SHEET_ID;
        if (spreadsheetId) {
            // Format ID as YYYYMMDDHHMM
            const now = new Date();
            const id = now.getFullYear().toString() +
                (now.getMonth() + 1).toString().padStart(2, '0') +
                now.getDate().toString().padStart(2, '0') +
                now.getHours().toString().padStart(2, '0') +
                now.getMinutes().toString().padStart(2, '0');

            const rowData = [
                id, // Column A: ID
                analysis // Column B: Formatted Report
            ];
            await appendToSheet(spreadsheetId, 'spx_analysis_log_01!A:B', [rowData]);
        }

        return NextResponse.json({
            success: true,
            analysis
        });

    } catch (error: any) {
        console.error('API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
