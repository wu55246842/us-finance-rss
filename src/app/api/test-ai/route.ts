import { NextResponse } from 'next/server';
import { generateText } from '@/lib/pollinations';

export async function POST(req: Request) {
    try {
        const { prompt, systemPrompt } = await req.json();

        if (!prompt) {
            return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
        }

        const messages = [];
        if (systemPrompt) {
            messages.push({ role: 'system' as const, content: systemPrompt });
        }
        messages.push({ role: 'user' as const, content: prompt });

        const response = await generateText({
            messages,
            model: 'gemini-fast',
        });

        return NextResponse.json({ response });
    } catch (error: any) {
        console.error('Test AI route error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to generate text' },
            { status: 500 }
        );
    }
}
