'use client';

import { useState } from 'react';
import { startTradingAnalysis, WorkflowState } from '@/lib/actions/trading-agents';
import { AgentCard } from '@/components/agents/AgentCard';
import { PriceChart } from '@/components/charts/PriceChart';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2, Sparkles, Clock, Server } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AgentsPage() {
    const [ticker, setTicker] = useState('');
    const [activeTicker, setActiveTicker] = useState(''); // New state for chart
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<WorkflowState | null>(null);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!ticker) return;

        setActiveTicker(ticker.toUpperCase()); // Trigger chart immediately
        setLoading(true);
        setResults(null);

        try {
            const data = await startTradingAnalysis(ticker.toUpperCase());
            setResults(data);
        } catch (error) {
            console.error("Analysis failed", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground p-8 font-sans transition-colors duration-300">
            <div className="max-w-7xl mx-auto space-y-10">

                {/* Header */}
                <div className="text-center space-y-6 pt-10">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium"
                    >
                        <Sparkles size={14} />
                        <span>AI-Powered Financial Intelligence</span>
                    </motion.div>

                    <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-cyan-500">
                            AI Agents
                        </span>
                    </h1>
                    <p className="text-muted-foreground max-w-2xl mx-auto text-lg leading-relaxed">
                        Multi-Agent Financial Analysis System. Powered by LLMs.
                    </p>
                </div>

                {/* Search Bar */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <form onSubmit={handleSearch} className="flex gap-4 max-w-xl mx-auto relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-primary to-cyan-500 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
                        <div className="relative flex-1 flex gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <Input
                                    placeholder="Enter Stock Ticker (e.g., NVDA)"
                                    className="pl-12 bg-card border-border focus:border-primary transition-all font-mono text-lg h-14 rounded-lg shadow-sm"
                                    value={ticker}
                                    onChange={(e) => setTicker(e.target.value)}
                                />
                            </div>
                            <Button
                                type="submit"
                                disabled={loading}
                                className="bg-primary hover:bg-primary/90 h-14 px-8 text-lg rounded-lg shadow-lg transition-all hover:scale-105 active:scale-95 text-primary-foreground"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : "Analyze"}
                            </Button>
                        </div>
                    </form>
                </motion.div>

                {/* Main Content Grid - Show when activeTicker is present (either loading or done) */}
                {activeTicker && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                            {/* Column 1: Analysts */}
                            <div className="space-y-6 lg:col-span-1">
                                <h2 className="text-xl font-semibold text-slate-300 border-b border-slate-800 pb-2">Analyst Team</h2>

                                {loading ? (
                                    <>
                                        <div className="h-64 bg-slate-900/50 rounded-xl animate-pulse border border-slate-800" />
                                        <div className="h-64 bg-slate-900/50 rounded-xl animate-pulse border border-slate-800" />
                                        <div className="h-64 bg-slate-900/50 rounded-xl animate-pulse border border-slate-800" />
                                    </>
                                ) : (
                                    <>
                                        <AgentCard
                                            title="Technical Analyst"
                                            role="technical"
                                            content={results?.technical?.content}
                                            status={results?.technical?.status}
                                        />
                                        <AgentCard
                                            title="Fundamental Analyst"
                                            role="fundamental"
                                            content={results?.fundamental?.content}
                                            status={results?.fundamental?.status}
                                        />
                                        <AgentCard
                                            title="Sentiment Analyst"
                                            role="sentiment"
                                            content={results?.sentiment?.content}
                                            status={results?.sentiment?.status}
                                        />
                                    </>
                                )}
                            </div>

                            {/* Column 2: Research & Decision */}
                            <div className="space-y-6 lg:col-span-2">
                                <h2 className="text-xl font-semibold text-slate-300 border-b border-slate-800 pb-2">Research & Decision</h2>

                                {/* Price Chart - Always shows if activeTicker is present */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    <PriceChart ticker={activeTicker} />
                                </motion.div>

                                {loading ? (
                                    <div className="h-96 bg-slate-900/50 rounded-xl animate-pulse border border-slate-800" />
                                ) : (
                                    <>
                                        <AgentCard
                                            title="Head of Research"
                                            role="researcher"
                                            content={results?.researcher?.content}
                                            status={results?.researcher?.status}
                                            className="border-indigo-500/30 bg-indigo-950/20"
                                        />

                                        <div className="pt-4">
                                            <AgentCard
                                                title="Final Investment Memo"
                                                role="reporter"
                                                content={results?.reporter?.content}
                                                status={results?.reporter?.status}
                                                isHighlight
                                                className="border-emerald-500/50 bg-emerald-950/30 shadow-2xl shadow-emerald-900/20"
                                            />
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {results?.error && (
                    <div className="p-4 bg-red-950/50 border border-red-900 rounded-lg text-red-200 text-center">
                        {results.error}
                    </div>
                )}

            </div>
        </div>
    );
}
