import { NextRequest, NextResponse } from "next/server";
import { mcpServer } from "@/lib/mcp";
import { NextjsSseTransport } from "@/lib/mcp-transport";

// We need a map to store active transports so we can route POST messages to them
// In a serverless env (Vercel), this map might be cleared between requests if the lambda dies.
// For true production MCP on serverless, we'd need a durable backend (Redis/Database) or
// just accept that long-lived connections might reset. 
// However, for "Keep-Alive" SSE in Next.js, it usually stays up for a bit.
// But the POST request comes in on a DIFFERENT lambda instance usually.
// This is a known issue for SSE on Serverless.
//
// Workaround: 
// 1. For local dev: Global variable works.
// 2. For Vercel: We might need a different transport (STDIO is standard for desktop apps, SSE for remote).
// 
// Let's implement the standard SSE flow, but beware of serverless limitations.
//
// actually, the standard MCP HTTP transport defines:
// GET /sse -> returns ID and stream
// POST /message?sessionId=ID -> sends message
//
// If the lambda that handles POST is different from the one holding the SSE connection (GET),
// we cannot route the message to the SSE stream via memory.
//
// THIS IS A CRITICAL ARCHITECTURAL ISSUE for Serverless MCP.
//
// However, for this task, we will attempt the implementation. 
// If deployed to a Vercel standard function (not edge), it might hit limits.
//
// Let's try to implement a simple "Single Instance" assumption for now (Local Dev),
// or acknowledge the limitation.
//
// Actually, many MCP implementations use a specialized server (Express) instead of Next.js API Routes for this reason.
// But we must work within Next.js.
//
// The Transport object needs to be persisted.
const transports = new Map<string, NextjsSseTransport>();

export async function GET(req: NextRequest) {
    const sessionId = crypto.randomUUID();
    const transport = new NextjsSseTransport(sessionId);
    transports.set(sessionId, transport);

    const stream = new ReadableStream({
        async start(controller) {
            transport.setController(controller);
            await transport.start();
            await mcpServer.connect(transport as any);

            // Clean up on close - handle abort signal
            req.signal.addEventListener("abort", () => {
                transports.delete(sessionId);
                transport.close();
                // We should ideally close the mcpServer connection too if possible, 
                // but the SDK handles that via transport.onclose usually.
            });
        },
        cancel() {
            transports.delete(sessionId);
            transport.close();
        }
    });

    return new NextResponse(stream, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        },
    });
}

export async function POST(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId || !transports.has(sessionId)) {
        return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const transport = transports.get(sessionId);

    if (!transport) {
        return NextResponse.json({ error: "Transport invalid" }, { status: 500 });
    }

    try {
        const body = await req.json();
        await transport.handlePostMessage(body);
        return NextResponse.json({ status: "accepted" });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
