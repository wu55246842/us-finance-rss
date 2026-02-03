import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { z } from "zod";
import { startTradingAnalysis } from "@/lib/actions/trading-agents";
import { getPriceHistory, getMarketNews } from "@/lib/api/market";

// Create the MCP server
export const mcpServer = new McpServer({
    name: "US Finance MCP",
    version: "1.0.0",
});

// Tool: Analyze Stock
mcpServer.tool(
    "analyze_stock",
    "Run a multi-agent AI analysis on a stock ticker (Technical, Fundamental, Sentiment).",
    {
        ticker: z.string().describe("The stock ticker symbol, e.g. NVDA, AAPL"),
        language: z.string().optional().default("English").describe("The language for the report"),
    },
    async ({ ticker, language }) => {
        try {
            const result = await startTradingAnalysis(ticker, language);
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(result, null, 2)
                    }
                ]
            };
        } catch (error: any) {
            return {
                content: [{ type: "text", text: `Error: ${error.message}` }],
                isError: true,
            };
        }
    }
);

// Tool: Get Price History
mcpServer.tool(
    "get_price_history",
    "Get historical price data (Open, High, Low, Close, Volume) for a stock.",
    {
        ticker: z.string().describe("The stock ticker symbol"),
        days: z.number().optional().default(100).describe("Number of days to fetch"),
    },
    async ({ ticker, days }) => {
        const history = await getPriceHistory(ticker, days);
        return {
            content: [{ type: "text", text: JSON.stringify(history, null, 2) }],
        };
    }
);

// Tool: Get Market News
mcpServer.tool(
    "get_market_news",
    "Get recent market news headlines for a specific stock.",
    {
        ticker: z.string().describe("The stock ticker symbol"),
    },
    async ({ ticker }) => {
        const news = await getMarketNews(ticker);
        return {
            content: [{ type: "text", text: JSON.stringify(news, null, 2) }],
        };
    }
);

// Helper to handle Next.js Request for SSE
// Note: The SDK's SSEServerTransport is designed for express/node http usually,
// but we can adapt it for Next.js Route Handlers.
// However, the SDK might not export a simple "handleRequest" for Next.js App Router comfortably.
// We might need to manually handle the connection if the SDK transport relies on Node streams strictly.
// Let's implement a wrapper for Next.js App Router using the transport.

export async function handleMcpRequest(req: Request) {
    // This part is tricky because the official SDK's SSEServerTransport might expect node Response object.
    // For Next.js App Router, we usually need to return a `Response` (NextResponse) with a ReadableStream.

    // Simplification: We will just expose the tools via a custom route handler in `route.ts` 
    // that uses the `mcpServer` instance. 
    // BUT the standard way is to use the transport.

    // Let's rely on the route.ts to handle the transport binding details 
    // or use a lightweight custom transport if needed.
    // Ideally code in route.ts will init the transport and connect it.

    return mcpServer;
}
