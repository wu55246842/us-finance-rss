'use client';

import { motion } from 'framer-motion';
import { Sparkles, Terminal, Globe, Zap, Database, ExternalLink, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function MCPPage() {
    return (
        <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20">
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
                            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                                <Globe className="text-primary" />
                                What is MCP?
                            </h2>
                            <p className="text-muted-foreground leading-relaxed">
                                The Model Context Protocol (MCP) is a standard that allows AI models to communicate with external data and tools.
                                By connecting to our MCP server, your AI assistant gains the ability to <strong>analyze stocks</strong>, <strong>fetch prices</strong>, and <strong>read news</strong> in real-time.
                            </p>
                        </div>

                        <div>
                            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                                <Terminal className="text-primary" />
                                Connection Details
                            </h2>
                            <Card className="bg-card/50 border-primary/20">
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
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-primary to-cyan-500 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-1000" />
                        <Card className="relative bg-zinc-950 border-zinc-800 h-full">
                            <CardHeader>
                                <CardTitle>Claude Desktop Config</CardTitle>
                                <CardDescription>Add this to your <code>claude_desktop_config.json</code></CardDescription>
                            </CardHeader>
                            <CardContent>
                                <CodeCopyBlock
                                    className="h-[300px]"
                                    language="json"
                                    code={`{
  "mcpServers": {
    "us-finance": {
      "command": "node", 
      "args": [], 
      "url": "https://financea.me/api/mcp"
    }
  }
}`}
                                />
                                <p className="mt-4 text-xs text-muted-foreground">
                                    *Note: Since this is a remote server, your client must support the <code>url</code> field for SSE connections.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Tools Showcase */}
                <div className="space-y-8">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold">Available Tools</h2>
                        <p className="text-muted-foreground mt-2">Capabilities your AI gains when connected.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <ToolCard
                            title="analyze_stock"
                            desc="Runs a comprehensive multi-agent analysis (Technical, Fundamental, Sentiment) for any US stock."
                            args="ticker, language"
                            icon={<Sparkles className="w-6 h-6 text-purple-500" />}
                        />
                        <ToolCard
                            title="get_price_history"
                            desc="Fetches historical OHLCV price data for charting or trend analysis."
                            args="ticker, days"
                            icon={<Database className="w-6 h-6 text-blue-500" />}
                        />
                        <ToolCard
                            title="get_market_news"
                            desc="Retrieves the latest headlines and news summaries for a specific company."
                            args="ticker"
                            icon={<Globe className="w-6 h-6 text-green-500" />}
                        />
                    </div>
                </div>

            </div>
        </div>
    );
}

// Helper Components

function ToolCard({ title, desc, args, icon }: { title: string, desc: string, args: string, icon: React.ReactNode }) {
    return (
        <Card className="hover:border-primary/50 transition-colors cursor-default bg-card/50">
            <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-md bg-background border border-border">
                        {icon}
                    </div>
                    <CardTitle className="font-mono text-lg">{title}</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground min-h-[40px]">{desc}</p>
                <div className="pt-4 border-t border-border/50">
                    <div className="flex gap-2 text-xs font-mono text-muted-foreground">
                        <span className="uppercase text-primary/70">Args:</span>
                        <span>{args}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function CodeCopyBlock({ code, language = 'text', className = '' }: { code: string, language?: string, className?: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className={`relative rounded-md bg-zinc-900 border border-zinc-800 p-4 font-mono text-sm overflow-auto custom-scrollbar ${className}`}>
            <button
                onClick={handleCopy}
                className="absolute right-2 top-2 p-1.5 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
            >
                {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
            </button>
            <pre className="text-zinc-300">
                <code>{code}</code>
            </pre>
        </div>
    );
}
