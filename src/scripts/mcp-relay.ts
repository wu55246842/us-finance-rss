import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
    ListResourcesRequestSchema,
    ReadResourceRequestSchema,
    ListPromptsRequestSchema,
    GetPromptRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

const REMOTE_URL = process.env.MCP_REMOTE_URL || "https://financea.me/api/mcp";

async function main() {
    const transport = new SSEClientTransport(new URL(REMOTE_URL));
    const client = new Client({ name: "relay-client", version: "1.0.0" }, { capabilities: { sampling: {} } });

    console.error(`Connecting to remote MCP server: ${REMOTE_URL}...`);
    await client.connect(transport);
    console.error("Connected to remote server.");

    const server = new Server({ name: "relay-server", version: "1.0.0" }, { capabilities: { tools: {}, resources: {}, prompts: {} } });

    server.setRequestHandler(ListToolsRequestSchema, () => client.listTools());
    server.setRequestHandler(CallToolRequestSchema, (req) => client.callTool(req.params));
    server.setRequestHandler(ListResourcesRequestSchema, () => client.listResources());
    server.setRequestHandler(ReadResourceRequestSchema, (req) => client.readResource(req.params));
    server.setRequestHandler(ListPromptsRequestSchema, () => client.listPrompts());
    server.setRequestHandler(GetPromptRequestSchema, (req) => client.getPrompt(req.params));

    const serverTransport = new StdioServerTransport();
    console.error("Starting local relay server on stdio...");
    await server.connect(serverTransport);
}

main().catch((error) => {
    console.error("Fatal error in MCP relay:", error);
    process.exit(1);
});
