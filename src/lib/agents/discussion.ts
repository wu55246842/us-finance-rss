import { getMarketIndices, getMarketNews, getTechnicalIndicators } from '@/lib/api/market';
import { generateText } from './core';
import { db } from '@/lib/db';
import { discussionThreads, discussionMessages } from '@/lib/db/schema';
import { desc, eq, gt } from 'drizzle-orm';

export interface AgentMessage {
    agentName: string;
    role: 'bull' | 'bear' | 'analyst';
    content: string;
    createdAt: Date;
}

const AGENTS = [
    { name: "Zylophos", role: "bull" },
    { name: "Vorgalth", role: "bear" },
    { name: "Xypheris", role: "analyst" }
] as const;




export async function generateNextTurn() {
    // 1. Find or Create Daily Thread
    const today = new Date().toISOString().split('T')[0];
    const topic = `SPX Analysis - ${today}`;

    let thread = await db.query.discussionThreads.findFirst({
        where: eq(discussionThreads.topic, topic),
    });

    if (!thread) {
        const [newThread] = await db.insert(discussionThreads).values({
            topic,
            summary: `Daily SPX Discussion for ${today}`
        }).returning();
        thread = newThread;
    }

    // 2. Fetch Recent Messages
    const recentMessages = await db.select().from(discussionMessages)
        .where(eq(discussionMessages.threadId, thread.id))
        .orderBy(desc(discussionMessages.createdAt))
        .limit(10);

    // 3. Throttling Check (15 mins)
    if (recentMessages.length > 0) {
        const lastMsgTime = new Date(recentMessages[0].createdAt).getTime();
        const now = Date.now();
        const diffMinutes = (now - lastMsgTime) / (1000 * 60);

        if (diffMinutes < 15) {
            return { skipped: true, reason: `Too soon. Last message was ${diffMinutes.toFixed(1)} mins ago.` };
        }
    }

    // 4. Fetch Market Context
    const indices = await getMarketIndices();
    const spx = indices.find(i => i.symbol === 'SPX500') || indices.find(i => i.symbol === '^GSPC');
    const vix = indices.find(i => i.symbol === 'VIX' || i.symbol === '^VIX');
    const tnx = indices.find(i => i.symbol === 'TLT');

    const technicals = await getTechnicalIndicators('^GSPC');
    const news = await getMarketNews('^GSPC');
    const newsSummary = news.slice(0, 3).join('; ');

    if (!spx) throw new Error('Failed to fetch SPX data');

    // 5. Determine Next Speaker
    // Simple round-robin logic based on last speaker
    let nextAgentIndex = 0;
    if (recentMessages.length > 0) {
        const lastAgentRole = recentMessages[0].agentRole;
        const lastAgentIndex = AGENTS.findIndex(a => a.role === lastAgentRole);
        if (lastAgentIndex !== -1) {
            nextAgentIndex = (lastAgentIndex + 1) % AGENTS.length;
        }
    }
    const nextAgent = AGENTS[nextAgentIndex];

    // 6. Construct Prompt
    // Reverse messages for chronological order in prompt
    const historyText = recentMessages.reverse().map(m => `${m.agentName} (${m.agentRole}): ${m.content}`).join('\n');

    const prompt = `
    You are roleplaying as ${nextAgent.name} (${nextAgent.role}).
    
    Current Market Context:
    - SPX: ${spx.currentPrice.toFixed(2)} (${spx.percentChange.toFixed(2)}%)
    - VIX: ${vix?.currentPrice.toFixed(2)}
    - TLT: ${tnx?.currentPrice.toFixed(2)}
    - RSI: ${technicals?.rsi.toFixed(2)}
    - News: ${newsSummary}

    Recent Conversation:
    ${historyText}

    Task: Respond to the conversation naturally based on your persona and the latest market data. Keep it concise (1-2 sentences).
    Persona Guide:
    - **Zylophos** (Bull): Futuristic optimist, believes in the ascent of technology and markets. Energetic, visionary.
    - **Vorgalth** (Bear): Ancient skeptic, warns of cycles, decay, and inevitable corrections. Heavy, foreboding tone.
    - **Xypheris** (Analyst): Pure logic, data-stream consciousness. Speaks in probabilities and levels. Neutral, precise.

    Output ONLY the JSON object for your message:
    { "agentName": "${nextAgent.name}", "role": "${nextAgent.role}", "content": "Your response here" }
    `;

    // 7. Call LLM
    const systemPrompt = "You are a financial market character. Output valid JSON only.";
    const responseText = await generateText(prompt, systemPrompt, 'openai');

    // 8. Clean and Save
    let messageContent = '';
    try {
        const jsonStr = responseText.replace(/```json\n?|\n?```/g, '').trim();
        const parsed = JSON.parse(jsonStr);
        messageContent = parsed.content;
    } catch (e) {
        console.error('Failed to parse turn JSON:', e);
        messageContent = responseText; // Fallback
    }

    const [savedMsg] = await db.insert(discussionMessages).values({
        threadId: thread.id,
        agentName: nextAgent.name,
        agentRole: nextAgent.role,
        content: messageContent
    }).returning();

    return { threadId: thread.id, message: savedMsg };
}
