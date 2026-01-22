import { NextResponse } from 'next/server';
import { generateDailyMarketAnalysis } from '@/lib/api/ai-analysis';

export async function GET(req: Request) {
    try {
        // Optional: Add simple secret check for "cron" security
        const { searchParams } = new URL(req.url);
        const secret = searchParams.get('secret');

        if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const result = await generateDailyMarketAnalysis();

        return NextResponse.json({
            success: true,
            message: 'Market analysis generated successfully',
            data: result
        });
    } catch (error: any) {
        console.error('Cron trigger error:', error);
        return NextResponse.json({
            success: false,
            error: error.message || 'Internal Server Error'
        }, { status: 500 });
    }
}
