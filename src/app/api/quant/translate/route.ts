import { generateJson } from "@/lib/agents/core";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { text, targetLang } = await req.json();

        if (!text || !targetLang) {
            return NextResponse.json({ error: "Missing text or targetLang" }, { status: 400 });
        }

        if (targetLang === 'en' || targetLang === 'English') {
            return NextResponse.json({ translatedText: text });
        }

        const systemPrompt = `You are a professional financial translator. Translate the following text to ${targetLang}. 
        Output JSON only: { "translatedText": "..." }
        - Maintain financial terminology accuracy.
        - Keep the tone of the original persona (e.g. Bullish/Energized vs Bearish/Somber).
        - Do not add explanations.`;

        const prompt = `Text to translate:\n"${text}"`;

        const result = await generateJson<{ translatedText: string }>(prompt, systemPrompt, 'openai');

        if (!result?.translatedText) {
            throw new Error("Translation failed to produce text");
        }

        return NextResponse.json({ translatedText: result.translatedText });

    } catch (error) {
        console.error("Translation error:", error);
        return NextResponse.json({ error: "Translation failed" }, { status: 500 });
    }
}
