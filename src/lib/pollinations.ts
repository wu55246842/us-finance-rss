/**
 * Pollinations AI API client for text generation.
 * Reference: https://pollinations.ai/
 * 
    gemini-fast	✅ 可用	推荐使用，速度快且稳定
    openai	✅ 可用	可用
    qwen-coder	✅ 可用	适合代码相关任务
    perplexity-fast	✅ 可用	适合联网搜索任务
    grok	✅ 可用	可用
 */

const POLLINATIONS_ENDPOINT = 'https://gen.pollinations.ai/v1/chat/completions';

export interface Message {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export interface PollinationsRequest {
    messages: Message[];
    model?: string;
    seed?: number;
    jsonMode?: boolean;
}

export interface PollinationsResponse {
    choices: {
        message: {
            content: string;
            role: string;
        };
    }[];
}


export async function generateText({
    messages,
    model = 'gemini-fast',
    seed,
    jsonMode = false,
}: PollinationsRequest): Promise<string> {
    const apiKey = process.env.POLLINATIONS_API_KEY || 'pk_fj1QiasPZGeKF2QuP';

    if (!apiKey) {
        console.warn('POLLINATIONS_API_KEY is not defined in environment variables.');
    }

    try {
        const response = await fetch(POLLINATIONS_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                messages,
                model,
                seed,
                jsonMode,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Pollinations AI error (${response.status}): ${errorText}`);
        }

        const data: PollinationsResponse = await response.json();
        return data.choices?.[0]?.message?.content || '';
    } catch (error) {
        console.error('Error calling Pollinations AI:', error);
        throw error;
    }
}
