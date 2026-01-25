import { NextResponse } from 'next/server';
import { generateText } from '@/lib/agents/core'; // Re-using our robust multi-provider generator

export async function POST(req: Request) {
    try {
        const { prompt } = await req.json();

        if (!prompt || typeof prompt !== 'string') {
            return NextResponse.json({ error: 'Invalid prompt provided' }, { status: 400 });
        }

        const systemPrompt = `
        You are an expert Quantitative Trading Strategy Developer.
        Your goal is to translate natural language trading ideas into valid JavaScript code.
        
        CONTEXT:
        The code will run inside a loop iterating over historical bars.
        
        AVAILABLE VARIABLES:
        - bar.close (number)
        - bar.open (number)
        - bar.high (number)
        - bar.low (number)
        - bar.volume (number)
        - position (number): 0 = Flat, 1 = Long
        
        AVAILABLE FUNCTIONS:
        - sma(period): Returns the Simple Moving Average (e.g., sma(20)).
        - rsi(period): Returns the Relative Strength Index (e.g., rsi(14)).
        
        TASK:
        Write ONLY the JavaScript code logic. NOT a full function definition.
        Return 'BUY', 'SELL', or null.
        
        NOTE: 
        - The engine AUTOMATICALLY enforces alternating Buy/Sell. 
        - You do NOT need to check 'position === 0' etc. 
        - Just return 'BUY' when your entry condition is met.
        
        EXAMPLE:
        User: "Buy when price is above 20 SMA and RSI is below 30"
        Code:
        const ma20 = sma(20);
        const r = rsi(14);
        
        if (bar.close > ma20 && r < 30) {
            return 'BUY';
        }
        if (bar.close < ma20) {
            return 'SELL';
        }
        
        IMPORTANT:
        - Do not use console.log.
        - Return ONLY the code block.
        `;

        const code = await generateText(prompt, systemPrompt, 'gemini-fast'); // Generic model request

        // Sanitize markdown if present
        const cleanCode = code.replace(/```javascript|```js|```/g, '').trim();

        return NextResponse.json({ code: cleanCode });

    } catch (error: any) {
        console.error('AI Generate Error:', error);
        return NextResponse.json({ error: 'Failed to generate strategy' }, { status: 500 });
    }
}
