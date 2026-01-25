import { NextResponse } from 'next/server';
import { generateDailyMarketAnalysis } from '@/lib/api/ai-analysis';

export async function GET(req: Request) {
    try {
        // Check Authentication (Query Param OR Bearer Header)
        const { searchParams } = new URL(req.url);
        const querySecret = searchParams.get('secret');
        const authHeader = req.headers.get('authorization');
        const bearerSecret = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

        const secret = querySecret || bearerSecret;

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
