'use client';

import { motion } from 'framer-motion';
import { Sparkles, Terminal, Globe, Zap, Database, ExternalLink, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function MCPPage() {
    return (
        <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-6 py-20 space-y-20">

                {/* Header Section */}
                <div className="text-center space-y-6 max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium"
                    >
                        <Zap size={14} />
                        <span>Now AI-Ready</span>
                    </motion.div>

                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight">
                        <span className="block text-foreground">Connect AI to</span>
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-cyan-500">
                            Real-Time Finance
                        </span>
                    </h1>
                    <p className="text-muted-foreground text-xl leading-relaxed max-w-2xl mx-auto">
                        We support the <strong className="text-foreground">Model Context Protocol (MCP)</strong>.
                        Connect Claude Desktop or other AI agents directly to our live market data and analysis tools.
                    </p>
                </div>

                {/* How it Works / Config Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    {/* Left: Explanation */}
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-foreground">
                                <Globe className="text-primary" />
                                What is MCP?
                            </h2>
                            <p className="text-muted-foreground leading-relaxed">
                                The Model Context Protocol (MCP) is a standard that allows AI models to communicate with external data and tools.
                                By connecting to our MCP server, your AI assistant gains the ability to <strong>analyze stocks</strong>, <strong>fetch prices</strong>, and <strong>read news</strong> in real-time.
                            </p>
                        </div>

                        <div>
                            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-foreground">
                                <Terminal className="text-primary" />
                                Connection Details
                            </h2>
                            <Card className="bg-card border-border shadow-sm">
                                <CardHeader>
                                    <CardTitle className="text-lg">Server-Sent Events (SSE)</CardTitle>
                                    <CardDescription>Use this endpoint to connect via HTTP SSE.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-mono text-muted-foreground uppercase">Endpoint URL</label>
                                        <CodeCopyBlock code="https://financea.me/api/mcp" />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-sm">
                            <strong>Note:</strong> Ensure your MCP client supports HTTP/SSE transport. Standard local clients often default to Stdio.
                        </div>
                    </div>

                    {/* Right: Configuration Snippet */}
                    <div className="relative group col-span-1 lg:col-span-1 h-full">
                        <div className="absolute -inset-0.5 bg-gradient-to-b from-primary/50 to-cyan-500/50 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000 dark:opacity-20" />
                        <Card className="relative bg-card/90 backdrop-blur-xl border-border h-full flex flex-col shadow-2xl dark:bg-zinc-950/90 dark:border-white/10">
                            <CardHeader className="pb-4 border-b border-border/50 dark:border-white/5">
                                <CardTitle className="flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-primary" />
                                    Connect to Claude
                                </CardTitle>
                                <CardDescription>Follow these steps to enable real-time data.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-8 flex-1 overflow-visible pt-6">

                                <div className="relative pl-6 border-l border-primary/20 hover:border-primary/50 transition-colors">
                                    <div className="absolute -left-[5px] top-0 w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-background dark:ring-zinc-950" />
                                    <h3 className="text-sm font-semibold text-foreground mb-3 leading-none">
                                        Step 1: Save Relay Script
                                    </h3>
                                    <p className="text-xs text-muted-foreground mb-4">
                                        Create <code>mcp-relay.ts</code> anywhere on your PC.
                                    </p>
                                    <CodeCopyBlock
                                        className="h-[200px] shadow-inner"
                                        language="typescript"
                                        filename="mcp-relay.ts"
                                        code={`import { Client } from "@modelcontextprotocol/sdk/client/index.js";
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

// Use the production URL
const REMOTE_URL = process.env.MCP_REMOTE_URL || "https://financea.me/api/mcp";

async function main() {
  const transport = new SSEClientTransport(new URL(REMOTE_URL));
  const client = new Client({ name: "relay-client", version: "1.0.0" }, { capabilities: { sampling: {} } });
  
  console.error(\`Connecting to \${REMOTE_URL}...\`);
  await client.connect(transport);
  console.error("Connected.");

  const server = new Server({ name: "relay-server", version: "1.0.0" }, { capabilities: { tools: {}, resources: {}, prompts: {} } });

  server.setRequestHandler(ListToolsRequestSchema, () => client.listTools());
  server.setRequestHandler(CallToolRequestSchema, (req) => client.callTool(req.params));
  server.setRequestHandler(ListResourcesRequestSchema, () => client.listResources());
  server.setRequestHandler(ReadResourceRequestSchema, (req) => client.readResource(req.params));
  server.setRequestHandler(ListPromptsRequestSchema, () => client.listPrompts());
  server.setRequestHandler(GetPromptRequestSchema, (req) => client.getPrompt(req.params));

  const serverTransport = new StdioServerTransport();
  await server.connect(serverTransport);
}

main().catch(console.error);`}
                                    />
                                </div>

                                <div className="relative pl-6 border-l border-transparent">
                                    <div className="absolute -left-[5px] top-0 w-2.5 h-2.5 rounded-full bg-muted ring-4 ring-background dark:bg-zinc-700 dark:ring-zinc-950" />
                                    <h3 className="text-sm font-semibold text-foreground mb-3 leading-none">
                                        Step 2: Configure Claude
                                    </h3>
                                    <p className="text-xs text-muted-foreground mb-4">
                                        Update <code>claude_desktop_config.json</code>
                                    </p>
                                    <CodeCopyBlock
                                        className="h-[180px] shadow-inner"
                                        language="json"
                                        filename="config.json"
                                        code={`{
  "mcpServers": {
    "us-finance": {
      "command": "npx",
      "args": [
        "-y",
        "tsx",
        "C:/path/to/mcp-relay.ts"
      ]
    }
  }
}`}
                                    />
                                    <p className="mt-3 text-[10px] text-muted-foreground font-mono">
                                        * Replace path with the actual location of mcp-relay.ts
                                    </p>
                                </div>

                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Tools Showcase */}
                <div className="space-y-12">
                    <div className="text-center space-y-4">
                        <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-muted-foreground">
                            Supercharge Your Agent
                        </h2>
                        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                            By connecting, your AI gains direct access to these professional financial tools.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <ToolCard
                            title="analyze_stock"
                            desc="Comprehensive multi-agent analysis covering Technicals, Fundamentals, and Sentiment."
                            args="ticker, language"
                            icon={<Sparkles className="w-5 h-5 text-purple-500" />}
                        />
                        <ToolCard
                            title="get_price_history"
                            desc="Precise OHLCV historical data for custom charting and trend analysis."
                            args="ticker, days"
                            icon={<Database className="w-5 h-5 text-blue-500" />}
                        />
                        <ToolCard
                            title="get_market_news"
                            desc="Real-time news feed aggregation for specific companies."
                            args="ticker"
                            icon={<Globe className="w-5 h-5 text-green-500" />}
                        />
                    </div>
                </div>

                {/* Resources Showcase (Calculated/Dynamic Data) */}
                <div className="space-y-12">
                    <div className="grid grid-cols-1 md:grid-cols-1 gap-6 max-w-3xl mx-auto">
                        <ToolCard
                            title="discussion://latest"
                            desc="Access the full transcript of today's AI Roundtable. Ideal for context-aware agents."
                            args="URI: discussion://latest"
                            icon={<Terminal className="w-5 h-5 text-orange-500" />}
                            className="bg-orange-500/5 border-orange-500/20"
                        />
                    </div>
                </div>

                {/* LLM Direct Integration */}
                <div className="space-y-10 pb-20 pt-10 border-t border-border">
                    <div className="text-center space-y-2">
                        <h2 className="text-2xl font-bold">For Custom Agents (standard LLMs)</h2>
                        <p className="text-muted-foreground">
                            Copy these function definitions for OpenAI or Qwen integration.
                        </p>
                    </div>

                    <div className="max-w-4xl mx-auto">
                        <Card className="bg-card border-border shadow-xl overflow-hidden dark:bg-zinc-950 dark:border-zinc-800">
                            <CardHeader className="bg-muted/50 border-b border-border py-3 dark:bg-zinc-900/50 dark:border-white/5">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <div className="flex gap-1.5 grayscale opacity-50 dark:grayscale-0 dark:opacity-100">
                                            <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/50" />
                                            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                                            <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/50" />
                                        </div>
                                        <CardTitle className="text-sm font-mono ml-2 text-muted-foreground">tools_schema.json</CardTitle>
                                    </div>
                                    <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => window.open('/api/mcp/schema', '_blank')}>
                                        <ExternalLink className="w-3 h-3 mr-2" />
                                        Open Raw
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <SchemaLoader />
                            </CardContent>
                        </Card>
                    </div>
                </div>

            </div>
        </div>
    );
}

// Helper Components

function ToolCard({ title, desc, args, icon, className }: { title: string, desc: string, args: string, icon: React.ReactNode, className?: string }) {
    return (
        <Card className={`group hover:-translate-y-1 hover:shadow-lg transition-all duration-300 bg-card border-border ${className}`}>
            <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2.5 rounded-lg bg-muted group-hover:bg-primary/5 border border-border group-hover:border-primary/30 transition-colors">
                        {icon}
                    </div>
                    <CardTitle className="font-mono text-base group-hover:text-primary transition-colors">{title}</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed min-h-[40px]">{desc}</p>
                <div className="pt-4 border-t border-border">
                    <div className="flex justify-between items-center text-xs font-mono text-muted-foreground/70">
                        <span className="uppercase tracking-wider">Parameters</span>
                        <span className="text-muted-foreground">{args}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function CodeCopyBlock({ code, language = 'text', className = '', filename }: { code: string, language?: string, className?: string, filename?: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        // Code blocks are always dark themed for readability
        <div className={`relative rounded-xl bg-zinc-950 border border-zinc-800 overflow-hidden group/code ${className}`}>
            {/* Mac-style Header */}
            <div className="flex items-center justify-between px-4 py-2 bg-zinc-900/50 border-b border-white/5">
                <div className="flex items-center gap-2">
                    <div className="flex gap-1.5 opacity-50 group-hover/code:opacity-100 transition-opacity">
                        <div className="w-2 h-2 rounded-full bg-red-500" />
                        <div className="w-2 h-2 rounded-full bg-yellow-500" />
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                    </div>
                    {filename && <span className="text-[10px] text-zinc-500 font-mono ml-2">{filename}</span>}
                </div>
                <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                >
                    {copied ? <Check size={10} className="text-green-400" /> : <Copy size={10} />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
            </div>

            <div className="p-4 overflow-auto custom-scrollbar h-[calc(100%-36px)]">
                <pre className="text-sm font-mono text-zinc-300 leading-relaxed">
                    <code>{code}</code>
                </pre>
            </div>
        </div>
    );
}

function SchemaLoader() {
    const [schema, setSchema] = useState('Loading schema...');

    // Fetch schema on mount
    if (schema === 'Loading schema...') {
        fetch('/api/mcp/schema')
            .then(res => res.json())
            .then(data => setSchema(JSON.stringify(data, null, 2)))
            .catch(err => setSchema('Failed to load schema: ' + err.message));
    }

    return <CodeCopyBlock code={schema} language="json" className="h-[400px] border-none rounded-none" />;
}
