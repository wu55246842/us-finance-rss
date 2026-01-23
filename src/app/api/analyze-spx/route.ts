import { NextResponse } from 'next/server';
import { generateSpxAnalysis } from '@/lib/actions/analyze';

export async function GET() {
    try {
        const analysis = await generateSpxAnalysis();
        return NextResponse.json({
            success: true,
            analysis
        });
    } catch (error: any) {
        console.error('API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
