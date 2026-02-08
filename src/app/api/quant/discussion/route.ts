import { NextResponse } from 'next/server';
import { generateNextTurn } from '@/lib/agents/discussion';
import { db } from '@/lib/db';
import { discussionThreads, discussionMessages } from '@/lib/db/schema';
import { desc, eq } from 'drizzle-orm';

export const maxDuration = 60; // Allow 60s for LLM generation

export async function POST() {
    try {
        const result = await generateNextTurn();
        return NextResponse.json(result);
    } catch (error: any) {
        console.error('Discussion generation failed:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET() {
    try {
        // Fetch TODAY's thread
        const today = new Date().toISOString().split('T')[0];
        const topic = `SPX Analysis - ${today}`;

        let thread = await db.query.discussionThreads.findFirst({
            where: eq(discussionThreads.topic, topic),
        });

        if (!thread) {
            return NextResponse.json({ thread: null, messages: [] });
        }

        const messages = await db.select().from(discussionMessages)
            .where(eq(discussionMessages.threadId, thread.id))
            .orderBy(discussionMessages.createdAt);

        return NextResponse.json({ thread, messages });
    } catch (error: any) {
        console.error('Failed to fetch discussion:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
