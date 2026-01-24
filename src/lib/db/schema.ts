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
