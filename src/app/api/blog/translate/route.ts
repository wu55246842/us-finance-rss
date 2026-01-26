import { NextResponse } from 'next/server';
import { generateText } from '@/lib/agents/core';

export async function POST(req: Request) {
    try {
        const { content, targetLang = 'Chinese' } = await req.json();

        if (!content) {
            return NextResponse.json({ error: 'Missing content to translate' }, { status: 400 });
        }

        const systemPrompt = `You are a professional financial translator. 
        Translate the following English financial blog post into ${targetLang}. 
        Keep the markdown formatting intact. 
        Ensure technical terms are translated accurately and the tone is professional.
        Return ONLY the translated text.`;

        // Use nova-fast as requested by the user
        const translatedText = await generateText(content, systemPrompt, 'nova-fast');

        return NextResponse.json({ translatedText });
    } catch (error: any) {
        console.error('Translation Error:', error);
        return NextResponse.json({ error: 'Failed to translate content' }, { status: 500 });
    }
}
