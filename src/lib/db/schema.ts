import { pgTable, serial, integer, text, timestamp, jsonb } from 'drizzle-orm/pg-core';


export const blogPosts = pgTable('blog_posts', {
    id: serial('id').primaryKey(),
    title: text('title').notNull(),
    content: text('content').notNull(),
    type: text('type').default('manual').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const systemSettings = pgTable('system_settings', {
    key: text('key').primaryKey(),
    value: text('value').notNull(),
    description: text('description'),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const discussionThreads = pgTable('discussion_threads', {
    id: serial('id').primaryKey(),
    topic: text('topic').notNull(),
    summary: text('summary').notNull(),

    metadata: jsonb('metadata').$type<{
        rollingSummary?: string; // 3-5 行滚动摘要（可选）
        agentState?: Record<string, {
            stance?: 'bull' | 'bear' | 'neutral';
            keyLevels?: { support?: number[]; resistance?: number[] };
            lastHypothesis?: string;
            lastUpdatedAt?: string;
        }>;
        lastContext?: {
            spx?: number; spxPct?: number; vix?: number; tlt?: number; rsi?: number;
            news?: string[];
            asof?: string;
        };
    }>(),

    createdAt: timestamp('created_at').defaultNow().notNull(),
});


export const discussionMessages = pgTable('discussion_messages', {
    id: serial('id').primaryKey(),

    threadId: integer('thread_id')
        .notNull()
        .references(() => discussionThreads.id),

    agentName: text('agent_name').notNull(),
    agentRole: text('agent_role').notNull(),
    content: text('content').notNull(),

    metadata: jsonb('metadata').$type<{
        stance?: 'bull' | 'bear' | 'neutral';
        timeHorizon?: 'intraday' | 'swing' | 'macro';
        keyLevels?: { support?: number[]; resistance?: number[] };
        risk?: string;
        confidence?: number; // 0..1

        cited?: { spx?: number; spxPct?: number; vix?: number; tlt?: number; rsi?: number; news?: string[]; asof?: string };
        audit?: { score?: number; issues?: string[]; action?: 'accept' | 'rewrite' | 'skip' };
        rawModel?: string; // 调试用（建议截断）
        skip?: boolean;
        skipReason?: string;
    }>(),

    createdAt: timestamp('created_at').defaultNow().notNull(),
});

