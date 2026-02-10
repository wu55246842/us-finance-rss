import { db } from "@/lib/db";
import { discussionMessages, discussionThreads } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const threadId = searchParams.get("threadId");

    try {
        if (threadId) {
            // Fetch specific thread messages
            const messages = await db
                .select()
                .from(discussionMessages)
                .where(eq(discussionMessages.threadId, parseInt(threadId)))
                .orderBy(discussionMessages.createdAt);

            return NextResponse.json(messages);
        } else {
            // Fetch list of threads
            const threads = await db
                .select()
                .from(discussionThreads)
                .orderBy(desc(discussionThreads.createdAt))
                .limit(30); // Last 30 days

            return NextResponse.json(threads);
        }
    } catch (error) {
        console.error("Failed to fetch history:", error);
        return NextResponse.json({ error: "Failed to fetch history" }, { status: 500 });
    }
}
