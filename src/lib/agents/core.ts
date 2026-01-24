import { AGENT_PROMPTS } from './prompts';

const POLLINATIONS_API_URL = 'https://text.pollinations.ai/';

export type AgentRole = 'technical' | 'fundamental' | 'sentiment' | 'researcher' | 'reporter';

interface AgentResponse {
    role: AgentRole;
    content: string;
    model: string;
}

export async function generateText(prompt: string, systemPrompt: string, model: string = 'openai'): Promise<string> {
    const maxRetries = 3;
    let attempt = 0;

    while (attempt < maxRetries) {
        try {
            // Pollinations text API typically uses a simple GET or POST. 
            // For complex prompts, POST is safer to avoid URL length limits.
            const response = await fetch(POLLINATIONS_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: prompt }
                    ],
                    model: model,
                    json: false
                }),
            });

            if (!response.ok) {
                if (response.status === 429) {
                    throw new Error("Too Many Requests");
                }
                throw new Error(`Pollinations API Error: ${response.statusText}`);
            }

            const text = await response.text();

            // Try to parse if it looks like JSON (some models return JSON even if json: false)
            try {
                const data = JSON.parse(text);
                // If it has 'content', use it. If it has 'reasoning_content' but no content (rare), use that? 
                // Usually we want 'content'. Some reasoning models put the thought process in reasoning_content.
                // Let's prefer 'content', fallback to 'reasoning_content' if content is empty/null which might happen in reasoning steps.
                if (data.choices && data.choices[0] && data.choices[0].message) {
                    return data.choices[0].message.content || data.choices[0].message.reasoning_content || text;
                }
                // Direct object return (rare but possible with some providers)
                if (data.content) return data.content;
                if (data.reasoning_content) return data.reasoning_content; // Fallback if no content

            } catch (e) {
                // Not JSON, return raw text
            }

            return text;

        } catch (error: any) {
            attempt++;
            console.error(`Attempt ${attempt} failed:`, error.message);

            if (attempt >= maxRetries) {
                console.error("Max retries reached. Failing.");
                return "Error generating analysis. Please try again.";
            }

            // Exponential backoff: 2s, 4s, 8s
            const delay = 2000 * Math.pow(2, attempt - 1);
            console.log(`Retrying in ${delay}ms...`);
            await new Promise(res => setTimeout(res, delay));
        }
    }
    return "Error generating analysis. Please try again.";
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
