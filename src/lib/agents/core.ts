import { AGENT_PROMPTS } from './prompts';

const POLLINATIONS_API_URL = 'https://text.pollinations.ai/openai';

export type AgentRole = 'technical' | 'fundamental' | 'sentiment' | 'researcher' | 'reporter';

interface AgentResponse {
    role: AgentRole;
    content: string;
    model: string;
}

const MAX_RETRIES = 3;

async function tryWithRetries(
    providerName: string,
    fn: () => Promise<string>,
    retries: number = MAX_RETRIES
): Promise<string | null> {
    let attempt = 0;
    while (attempt < retries) {
        try {
            return await fn();
        } catch (error: any) {
            attempt++;
            console.error(`${providerName} Attempt ${attempt} failed:`, error.message);
            if (attempt >= retries) return null;

            const delay = 1000 * Math.pow(2, attempt - 1); // 1s, 2s, 4s
            await new Promise(res => setTimeout(res, delay));
        }
    }
    return null;
}

export async function generateText(prompt: string, systemPrompt: string, model: string = 'openai'): Promise<string> {

    // 1. Pollinations (Priority 1)
    const pollinationsResult = await tryWithRetries("Pollinations", async () => {
        const response = await fetch(POLLINATIONS_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: prompt }],
                model: model,
                json: false
            }),
        });

        if (!response.ok) throw new Error(`Status ${response.status}`);
        const text = await response.text();

        // Try to unwrap JSON if present
        try {
            const data = JSON.parse(text);
            return data.choices?.[0]?.message?.content || data.content || text;
        } catch { return text; }
    }, 3);

    if (pollinationsResult) return pollinationsResult;

    // 2. Poixe (Priority 2 - 3 Retries)
    if (process.env.POIXE_API_KEY) {
        console.log("Fallback: Switching to Poixe API...");
        const poixeResult = await tryWithRetries("Poixe", async () => {
            const resp = await fetch("https://api.poixe.com/v1/chat/completions", {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${process.env.POIXE_API_KEY}`
                },
                body: JSON.stringify({
                    "model": "gemini-3-flash-preview:free",
                    "messages": [{ "role": "system", "content": systemPrompt }, { "role": "user", "content": prompt }]
                })
            });

            if (!resp.ok) throw new Error(`Status ${resp.status}`);
            const data = await resp.json();
            return data.choices?.[0]?.message?.content || "";
        }, 3);

        if (poixeResult) return poixeResult;
    }

    // 3. OpenRouter (Priority 3 - Single Attempt)
    if (process.env.OPENROUTER_API_KEY) {
        console.log("Fallback: Switching to OpenRouter API...");
        try {
            const resp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: 'POST',
                headers: {
                    "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    "HTTP-Referer": "https://financea.me",
                    "X-Title": "financea.me",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    "model": "google/gemini-2.0-flash-001",
                    "messages": [{ "role": "system", "content": systemPrompt }, { "role": "user", "content": prompt }]
                })
            });

            if (resp.ok) {
                const data = await resp.json();
                return data.choices?.[0]?.message?.content || "";
            }
        } catch (e) {
            console.error("OpenRouter failed:", e);
        }
    }

    return "Error generating analysis. All providers failed. Please try again later.";
}

export async function runAgentAnalysis(role: AgentRole, data: string): Promise<AgentResponse> {
    const systemPrompt = AGENT_PROMPTS[role];
    const content = await generateText(data, systemPrompt);
    return {
        role,
        content,
        model: 'gemini-fast'
    };
}
