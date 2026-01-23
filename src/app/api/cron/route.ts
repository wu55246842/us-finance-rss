import { NextResponse } from 'next/server';
export const runtime = 'nodejs';
import { generateSpxAnalysis } from '@/lib/actions/analyze';

export async function GET(request: Request) {
    if (request.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
        return new Response('Unauthorized', { status: 401 });
    }

    try {
        await generateSpxAnalysis();
        return NextResponse.json({ ok: true });
    } catch (error: any) {
        console.error('Cron Job Error:', error);
        return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }
}
