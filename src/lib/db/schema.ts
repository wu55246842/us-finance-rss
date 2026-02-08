import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

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
    createdAt: timestamp('created_at').defaultNow().notNull(),
    summary: text('summary'),
});

export const discussionMessages = pgTable('discussion_messages', {
    id: serial('id').primaryKey(),
    threadId: serial('thread_id').references(() => discussionThreads.id),
    agentName: text('agent_name').notNull(),
    agentRole: text('agent_role').notNull(),
    content: text('content').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});
