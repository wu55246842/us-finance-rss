import { getMarketIndices, getMarketNews, getTechnicalIndicators } from '@/lib/api/market';
import { getLiveNews } from '@/lib/api/wscn';
import { generateText, generateJson } from './core';
import { db } from '@/lib/db';
import { discussionThreads, discussionMessages } from '@/lib/db/schema';
import { desc, eq } from 'drizzle-orm';

const AGENTS = [
    { name: 'Zylophos', role: 'bull' },
    { name: 'Vorgalth', role: 'bear' },
    { name: 'Xypheris', role: 'analyst' },
] as const;

type AgentRole = typeof AGENTS[number]['role'];

type ThreadMeta = {
    rollingSummary?: string;
    agentState?: Record<string, {
        stance?: 'bull' | 'bear' | 'neutral';
        keyLevels?: { support?: number[]; resistance?: number[] };
        lastHypothesis?: string;
        lastUpdatedAt?: string;
    }>;
    lastContext?: {
        spx?: number; spxPct?: number; vix?: number; tlt?: number; rsi?: number;
        news?: string[]; asof?: string;
    };
};

type TraderOutput = {
    agentName: string;
    role: AgentRole;
    content: string;
    metadata?: {
        stance?: 'bull' | 'bear' | 'neutral';
        timeHorizon?: 'intraday' | 'swing' | 'macro';
        keyLevels?: { support?: number[]; resistance?: number[] };
        risk?: string;
        confidence?: number;
        hypothesis?: string;
    };
    skip?: boolean;
    reason?: string;
};

type CriticVerdict = {
    pass: boolean;
    score: number; // 0..100
    issues: string[];
    action: 'accept' | 'rewrite' | 'skip';
    rewriteHints?: string[];
};

function safeNum(n: unknown): number | undefined {
    return typeof n === 'number' && Number.isFinite(n) ? n : undefined;
}

function fmt(n: unknown, digits = 2): string {
    const v = safeNum(n);
    return v === undefined ? 'N/A' : v.toFixed(digits);
}

function safeStr(s: unknown, fallback = 'N/A'): string {
    return typeof s === 'string' && s.trim() ? s.trim() : fallback;
}

function clampText(s: string, maxLen = 320): string {
    const t = s.replace(/\s+/g, ' ').trim();
    return t.length <= maxLen ? t : t.slice(0, maxLen - 1) + '…';
}

function normalizeMetadata(md: any) {
    if (!md || typeof md !== 'object') return {};
    const out: any = {};

    if (md.stance === 'bull' || md.stance === 'bear' || md.stance === 'neutral') out.stance = md.stance;
    if (md.timeHorizon === 'intraday' || md.timeHorizon === 'swing' || md.timeHorizon === 'macro') out.timeHorizon = md.timeHorizon;

    if (md.keyLevels && typeof md.keyLevels === 'object') {
        const kl: any = {};
        if (Array.isArray(md.keyLevels.support)) kl.support = md.keyLevels.support.filter((x: any) => typeof x === 'number' && Number.isFinite(x));
        if (Array.isArray(md.keyLevels.resistance)) kl.resistance = md.keyLevels.resistance.filter((x: any) => typeof x === 'number' && Number.isFinite(x));
        if (Object.keys(kl).length) out.keyLevels = kl;
    }

    if (typeof md.risk === 'string' && md.risk.trim()) out.risk = clampText(md.risk, 200);

    if (typeof md.confidence === 'number' && Number.isFinite(md.confidence)) {
        out.confidence = Math.max(0, Math.min(1, md.confidence));
    }

    if (typeof md.hypothesis === 'string' && md.hypothesis.trim()) {
        out.hypothesis = clampText(md.hypothesis, 180);
    }

    return out;
}

function pickNextAgent(recentMessages: any[]) {
    // round-robin by last agentName
    let nextAgentIndex = 0;
    if (recentMessages.length > 0) {
        const lastName = recentMessages[0].agentName;
        const lastIdx = AGENTS.findIndex((a) => a.name === lastName);
        if (lastIdx !== -1) nextAgentIndex = (lastIdx + 1) % AGENTS.length;
    }
    return AGENTS[nextAgentIndex];
}

function buildContextText(cited: any, newsSummary: string) {
    return [
        `- SPX: ${fmt(cited.spx)} (${fmt(cited.spxPct)}%)`,
        `- VIX: ${fmt(cited.vix)}`,
        `- TLT: ${fmt(cited.tlt)}`,
        `- RSI: ${fmt(cited.rsi)}`,
        `- News: ${newsSummary}`,
    ].join('\n');
}

function isMaterialUpdate(prev?: ThreadMeta['lastContext'], cur?: ThreadMeta['lastContext']) {
    if (!cur) return true;
    if (!prev) return true;

    const spxMove = (safeNum(cur.spxPct) ?? 0) - (safeNum(prev.spxPct) ?? 0);
    const vixMove = (safeNum(cur.vix) ?? 0) - (safeNum(prev.vix) ?? 0);
    const rsiMove = (safeNum(cur.rsi) ?? 0) - (safeNum(prev.rsi) ?? 0);

    // news changed?
    const prevNews = (prev.news || []).join(' | ');
    const curNews = (cur.news || []).join(' | ');
    const newsChanged = prevNews !== curNews;

    // 你可以按实际波动调整阈值
    const material =
        Math.abs(spxMove) >= 0.15 ||
        Math.abs(vixMove) >= 0.5 ||
        Math.abs(rsiMove) >= 2.0 ||
        newsChanged;

    return material;
}

async function auditWithCritic(input: {
    agentName: string;
    role: AgentRole;
    content: string;
    marketContextText: string;
    lastSameAgentContent?: string;
}): Promise<CriticVerdict> {
    const CRITIC_SYSTEM =
        'You are a strict audit critic for financial-market dialogue. No creativity. Return JSON only.';

    const prompt = `
Market Context:
${input.marketContextText}

Candidate Message:
${input.agentName} (${input.role}): ${input.content}

Last message from same agent (if any):
${input.lastSameAgentContent || '(none)'}

Rules:
- Must reference at least ONE of SPX/VIX/TLT/RSI/News explicitly.
- Any numbers must match Market Context exactly (no invented numbers).
- No certainty language: guarantee/must/certain/all-in/稳赚/必然.
- Analyst must avoid emotional words.
- If any Market Context value is "N/A", message must express uncertainty (no hard claim).
- If highly repetitive vs lastSameAgentContent AND no new context usage -> suggest skip.

Return ONLY JSON:
{ "pass": true/false, "score": 0-100, "issues": ["..."], "action": "accept|rewrite|skip", "rewriteHints": ["..."] }
`.trim();

    const res = await generateJson<CriticVerdict>(prompt, CRITIC_SYSTEM, 'openai');
    return res || {
        pass: false,
        score: 0,
        issues: ['Critic parse failed'],
        action: 'rewrite',
        rewriteHints: ['Return valid JSON only.'],
    };
}

async function rewriteOnce(input: {
    agentName: string;
    role: AgentRole;
    marketContextText: string;
    conversationText: string;
    rewriteHints: string[];
    threadRollingSummary?: string;
    lastAgentState?: any;
}): Promise<TraderOutput | null> {
    const system =
        'You rewrite a market message to comply with strict audit rules. Output JSON only.';

    const prompt = `
Market Context:
${input.marketContextText}

Rolling Summary (may be empty):
${input.threadRollingSummary || '(none)'}

Last known state for this agent:
${input.lastAgentState ? JSON.stringify(input.lastAgentState) : '(none)'}

Recent Conversation:
${input.conversationText}

Rewrite instructions:
- Output ONLY JSON, no extra text.
- Keep content 1–2 sentences.
- Reference at least ONE of SPX/VIX/TLT/RSI/News.
- Any numbers must match Market Context exactly.
- Apply these critic hints:
${input.rewriteHints.map(h => `- ${h}`).join('\n')}
- Stay in persona.

Return JSON:
{
  "agentName": "${input.agentName}",
  "role": "${input.role}",
  "content": "...",
  "metadata": {
    "stance": "bull|bear|neutral",
    "timeHorizon": "intraday|swing|macro",
    "keyLevels": { "support": [numbers], "resistance": [numbers] },
    "risk": "short invalidation condition",
    "confidence": 0.0-1.0,
    "hypothesis": "one short sentence"
  }
}
`.trim();

    const res = await generateJson<TraderOutput>(prompt, system, 'openai');
    if (!res || typeof res.content !== 'string') return null;
    return res;
}

export async function generateNextTurn() {
    // 1) Find or create daily thread
    const today = new Date().toISOString().split('T')[0];
    const topic = `SPX Analysis - ${today}`;

    let thread = await db.query.discussionThreads.findFirst({
        where: eq(discussionThreads.topic, topic),
    });

    if (!thread) {
        const [newThread] = await db
            .insert(discussionThreads)
            .values({
                topic,
                summary: `Daily SPX Discussion for ${today}`,
                metadata: { agentState: {} },
            })
            .returning();
        thread = newThread;
    }

    const threadMeta: ThreadMeta = (thread as any).metadata || { agentState: {} };

    // 2) Fetch recent messages
    const recentMessages = await db
        .select()
        .from(discussionMessages)
        .where(eq(discussionMessages.threadId, thread.id))
        .orderBy(desc(discussionMessages.createdAt))
        .limit(10);

    // 3) Throttling (15 mins)
    if (recentMessages.length > 0) {
        const lastMsgTime = new Date(recentMessages[0].createdAt).getTime();
        const diffMinutes = (Date.now() - lastMsgTime) / (1000 * 60);
        if (diffMinutes < 15) {
            return { skipped: true, reason: `Too soon. Last message was ${diffMinutes.toFixed(1)} mins ago.` };
        }
    }

    // 4) Fetch market context
    const indices = await getMarketIndices();
    const spx = indices.find(i => i.symbol === 'SPX500') || indices.find(i => i.symbol === '^GSPC');
    const vix = indices.find(i => i.symbol === 'VIX') || indices.find(i => i.symbol === '^VIX');
    const tlt = indices.find(i => i.symbol === 'TLT');

    const technicals = await getTechnicalIndicators('^GSPC');
    // const news = await getMarketNews('^GSPC'); // Old Finnhub
    const wscnNews = await getLiveNews(20);

    if (!spx) throw new Error('Failed to fetch SPX data');

    const newsList = wscnNews.map(n => `${n.display_time ? new Date(n.display_time * 1000).toLocaleTimeString() : ''} ${n.content_text}`);
    const newsSummary = newsList.join('; ') || 'No major headlines.';

    const cited = {
        spx: safeNum((spx as any).currentPrice),
        spxPct: safeNum((spx as any).percentChange),
        vix: safeNum((vix as any)?.currentPrice),
        tlt: safeNum((tlt as any)?.currentPrice),
        rsi: safeNum((technicals as any)?.rsi),
        news: newsList,
        asof: new Date().toISOString(),
    };

    // 4.1) 如果没有实质变化，允许 skip（减少水话）
    const material = isMaterialUpdate(threadMeta.lastContext, cited);
    if (!material) {
        return { skipped: true, reason: 'No material context update since last turn.' };
    }

    // 5) 事件触发抢话权：覆盖 round-robin
    const eventPick = chooseSpeakerByEvents({
        prevContext: threadMeta.lastContext,
        curContext: cited,
        agentState: threadMeta.agentState,
    });

    const nextAgent = pickNextAgentWithOverride(recentMessages, eventPick.forcedAgentName);

    // 6) Build conversation text (chronological)
    const historyText = recentMessages
        .slice()
        .reverse()
        .map(m => `${m.agentName} (${m.agentRole}): ${m.content}`)
        .join('\n');

    const marketContextText = buildContextText(cited, newsSummary);

    const lastSameAgent = recentMessages.find(m => m.agentName === nextAgent.name);
    const lastSameAgentContent = lastSameAgent?.content;

    const lastAgentState = threadMeta.agentState?.[nextAgent.name];

    // 7) Trader attempt
    const traderSystem = 'You are a financial-market character. Output JSON only. No markdown.';
    const traderPrompt = `
You are roleplaying as ${nextAgent.name} (${nextAgent.role}).

Hard constraints:
- Output ONLY valid JSON. No extra text.
- content must be 1–2 sentences.
- MUST explicitly reference at least ONE of SPX/VIX/TLT/RSI/News.
- Any numbers must match Market Context exactly (no invented numbers).
- If any Market Context value is "N/A", express uncertainty (no hard claim).
- Stay strictly in persona.

Market Context:
${marketContextText}

Event override (if any):
${eventPick.reason ? `- Trigger: ${eventPick.reason}` : '(none)'}

Rolling Summary (may be empty):
${threadMeta.rollingSummary || '(none)'}

Last known state for this agent:
${lastAgentState ? JSON.stringify(lastAgentState) : '(none)'}

Recent Conversation:
${historyText || '(No prior messages yet.)'}

Persona Guide:
- Zylophos (Bull): opportunity + trigger, energetic, visionary.
- Vorgalth (Bear): risk + invalidation, heavy, foreboding.
- Xypheris (Analyst): probabilities + key levels, neutral, precise, no emotional words.

Return JSON:
{
  "agentName": "${nextAgent.name}",
  "role": "${nextAgent.role}",
  "content": "...",
  "metadata": {
    "stance": "bull|bear|neutral",
    "timeHorizon": "intraday|swing|macro",
    "keyLevels": { "support": [numbers], "resistance": [numbers] },
    "risk": "short invalidation condition",
    "confidence": 0.0-1.0,
    "hypothesis": "one short sentence"
  }
}
`.trim();

    let traderOut = await generateJson<TraderOutput>(traderPrompt, traderSystem, 'openai');
    if (!traderOut || typeof traderOut.content !== 'string') {
        const raw = await generateText(traderPrompt, traderSystem, 'openai');
        traderOut = { agentName: nextAgent.name, role: nextAgent.role, content: clampText(raw, 240), metadata: { confidence: 0.35 } };
    }

    // 8) Critic audit
    let verdict = await auditWithCritic({
        agentName: nextAgent.name,
        role: nextAgent.role,
        content: traderOut.content,
        marketContextText,
        lastSameAgentContent,
    });

    // 9) Rewrite once if needed
    if (verdict.action === 'rewrite') {
        const rewritten = await rewriteOnce({
            agentName: nextAgent.name,
            role: nextAgent.role,
            marketContextText,
            conversationText: historyText || '(No prior messages yet.)',
            rewriteHints: verdict.rewriteHints || ['Fix issues and return valid JSON only.'],
            threadRollingSummary: threadMeta.rollingSummary,
            lastAgentState,
        });

        if (rewritten?.content) {
            traderOut = rewritten;
            verdict = await auditWithCritic({
                agentName: nextAgent.name,
                role: nextAgent.role,
                content: traderOut.content,
                marketContextText,
                lastSameAgentContent,
            });
        }
    }

    // 10) If still bad or critic says skip → skip
    if (verdict.action === 'skip' || !verdict.pass || verdict.score < 60) {
        return {
            skipped: true,
            reason: `Critic blocked message (score=${verdict.score}).`,
            issues: verdict.issues,
        };
    }

    // 11) Finalize metadata
    const content = clampText(traderOut.content, 320);
    const metaFromModel = normalizeMetadata(traderOut.metadata);

    const finalMetadata = {
        ...metaFromModel,
        cited,
        audit: { score: verdict.score, issues: verdict.issues, action: verdict.action, event: eventPick.reason || null },
        rawModel: clampText(JSON.stringify(traderOut), 600),
    };

    // 11.5) FINAL CHECK: Concurrency / Race Condition
    // Before inserting, check if a message was just added by another process while we were generating.
    const [latestMsg] = await db
        .select()
        .from(discussionMessages)
        .where(eq(discussionMessages.threadId, thread.id))
        .orderBy(desc(discussionMessages.createdAt))
        .limit(1);

    if (latestMsg) {
        const lastTime = new Date(latestMsg.createdAt).getTime();
        const diff = (Date.now() - lastTime) / (1000 * 60);
        if (diff < 2) { // strict 2-min guard for race conditions
            return {
                skipped: true,
                reason: `Race condition detected. A message was added ${diff.toFixed(1)} mins ago while generating.`,
            };
        }
    }

    // 12) Save message
    const [savedMsg] = await db.insert(discussionMessages).values({
        threadId: thread.id,
        agentName: nextAgent.name,
        agentRole: nextAgent.role,
        content,
        metadata: finalMetadata,
    }).returning();

    // 13) Update thread metadata (state memory + lastContext)
    const newThreadMeta: ThreadMeta = {
        ...threadMeta,
        lastContext: cited,
        agentState: {
            ...(threadMeta.agentState || {}),
            [nextAgent.name]: {
                stance: finalMetadata.stance,
                keyLevels: finalMetadata.keyLevels,
                lastHypothesis: (finalMetadata as any).hypothesis,
                lastUpdatedAt: new Date().toISOString(),
            },
        },
    };

    await db.update(discussionThreads)
        .set({ metadata: newThreadMeta })
        .where(eq(discussionThreads.id, thread.id));

    // 14) rollingSummary：每 20 条触发一次更新
    const summaryResult = await maybeUpdateRollingSummary(thread.id);

    return {
        threadId: thread.id,
        message: savedMsg,
        audit: finalMetadata.audit,
        rollingSummary: summaryResult.updated ? 'updated' : 'unchanged',
        messageCount: summaryResult.count,
    };
}


async function maybeUpdateRollingSummary(threadId: number) {
    // 统计已落库消息数量
    const allMsgs = await db.select({ id: discussionMessages.id })
        .from(discussionMessages)
        .where(eq(discussionMessages.threadId, threadId));

    const count = allMsgs.length;

    // 每 20 条触发一次：20, 40, 60...
    if (count === 0 || count % 20 !== 0) return { updated: false, count };

    // 拉最近 20 条（按时间升序给模型）
    const last20 = await db.select()
        .from(discussionMessages)
        .where(eq(discussionMessages.threadId, threadId))
        .orderBy(desc(discussionMessages.createdAt))
        .limit(20);

    const history = last20.slice().reverse().map(m => {
        return `${m.agentName} (${m.agentRole}): ${m.content}`;
    }).join('\n');

    // 取 thread metadata 里的 lastContext（如果有）
    const thread = await db.query.discussionThreads.findFirst({
        where: eq(discussionThreads.id, threadId),
    });

    const meta = ((thread as any)?.metadata || {}) as any;
    const lastContext = meta.lastContext || {};

    const contextText = [
        `SPX: ${fmt(lastContext.spx)} (${fmt(lastContext.spxPct)}%)`,
        `VIX: ${fmt(lastContext.vix)}`,
        `TLT: ${fmt(lastContext.tlt)}`,
        `RSI: ${fmt(lastContext.rsi)}`,
        `News: ${(lastContext.news || []).slice(0, 3).join('; ') || 'N/A'}`,
    ].join('\n');

    const system = `You summarize a multi-agent financial discussion. Output plain text ONLY (no JSON).`;
    const prompt = `
Market Context Snapshot:
${contextText}

Recent 20 messages (chronological):
${history}

Task:
Write a rolling summary in 3–5 bullet lines (each line <= 120 chars).
Include:
- Main disagreement(s) and any consensus
- Key levels / conditions mentioned (if any)
- Most important "watch next" trigger(s)
Avoid adding new facts not present above.
`.trim();

    const summaryText = await generateText(prompt, system, 'openai');
    const rollingSummary = summaryText
        .replace(/```[\s\S]*?```/g, '')
        .trim()
        .split('\n')
        .map(x => x.trim())
        .filter(Boolean)
        .slice(0, 6) // 防止模型超长；最多保留 6 行
        .join('\n');

    // 写回 thread.metadata.rollingSummary
    await db.update(discussionThreads)
        .set({
            metadata: {
                ...(meta || {}),
                rollingSummary,
            },
        })
        .where(eq(discussionThreads.id, threadId));

    return { updated: true, count };
}

function approxCrossed(level: number, prev?: number, cur?: number, tolerancePct = 0.05) {
    if (prev === undefined || cur === undefined) return false;
    const tol = level * (tolerancePct / 100);
    // 从下到上穿越
    const up = prev < level - tol && cur >= level + tol;
    // 从上到下穿越
    const down = prev > level + tol && cur <= level - tol;
    return up || down;
}

function chooseSpeakerByEvents(params: {
    prevContext?: ThreadMeta['lastContext'];
    curContext: ThreadMeta['lastContext'];
    agentState?: ThreadMeta['agentState'];
}): { forcedAgentName?: string; reason?: string } {
    const prev = params.prevContext || {};
    const cur = params.curContext || {};
    const spxPrev = safeNum(prev.spx);
    const spxCur = safeNum(cur.spx);
    const spxPctPrev = safeNum(prev.spxPct) ?? 0;
    const spxPctCur = safeNum(cur.spxPct) ?? 0;

    const vixPrev = safeNum(prev.vix);
    const vixCur = safeNum(cur.vix);

    const vixDelta = (vixCur ?? 0) - (vixPrev ?? 0);
    const spxPctDelta = spxPctCur - spxPctPrev;

    const prevNews = (prev.news || []).join(' | ');
    const curNews = (cur.news || []).join(' | ');
    const newsChanged = prevNews !== curNews;

    // 1) VIX 急升：Bear 抢话
    if (vixPrev !== undefined && vixCur !== undefined && vixDelta >= 1.0) {
        return { forcedAgentName: 'Vorgalth', reason: `VIX spike (+${vixDelta.toFixed(2)})` };
    }

    // 2) VIX 急跌：Bull 抢话
    if (vixPrev !== undefined && vixCur !== undefined && vixDelta <= -1.0) {
        return { forcedAgentName: 'Zylophos', reason: `VIX drop (${vixDelta.toFixed(2)})` };
    }

    // 3) SPX 大幅波动 或 新闻变化：Analyst 抢话
    if (Math.abs(spxPctDelta) >= 0.5 || newsChanged) {
        return { forcedAgentName: 'Xypheris', reason: `SPX move (${spxPctDelta.toFixed(2)}%) or news changed` };
    }

    // 4) 关键位穿越：Analyst 抢话（利用 agentState 中保存的 keyLevels）
    const states = params.agentState || {};
    // 优先用 Analyst 自己的 keyLevels（更合理），没有就用任意 agent 最近保存的
    const analystLevels =
        states['Xypheris']?.keyLevels ||
        states['Zylophos']?.keyLevels ||
        states['Vorgalth']?.keyLevels;

    const supports = analystLevels?.support || [];
    const resistances = analystLevels?.resistance || [];

    if (spxPrev !== undefined && spxCur !== undefined) {
        for (const r of resistances) {
            if (approxCrossed(r, spxPrev, spxCur)) {
                return { forcedAgentName: 'Xypheris', reason: `Crossed resistance ~${r}` };
            }
        }
        for (const s of supports) {
            if (approxCrossed(s, spxPrev, spxCur)) {
                return { forcedAgentName: 'Xypheris', reason: `Crossed support ~${s}` };
            }
        }
    }

    return {};
}

function pickNextAgentWithOverride(recentMessages: any[], forcedAgentName?: string) {
    if (forcedAgentName) {
        const forced = AGENTS.find(a => a.name === forcedAgentName);
        if (forced) return forced;
    }
    return pickNextAgent(recentMessages);
}

