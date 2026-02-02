'use client';

import { useState, useEffect, useRef } from 'react';
import { startTradingAnalysis, WorkflowState } from '@/lib/actions/trading-agents';
import { AgentCard } from '@/components/agents/AgentCard';
import { PriceChart } from '@/components/charts/PriceChart';
import { AgentWorkflowExplainer } from '@/components/agents/AgentWorkflowExplainer';
import { Button } from '@/components/ui/button';
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import { Search, Loader2, Sparkles, Languages } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/openstock/utils'; // Assuming this exists based on command.tsx

const LANGUAGES = [
    { code: 'English', label: 'English', flag: '🇺🇸' },
    { code: 'Chinese (Simplified)', label: '简体中文', flag: '🇨🇳' },
    { code: 'Japanese', label: '日本語', flag: '🇯🇵' },
    { code: 'Spanish', label: 'Español', flag: '🇪🇸' },
];

interface Ticker {
    symbol: string;
    name: string;
}

export default function AgentsPage() {
    const [ticker, setTicker] = useState('');
    const [activeTicker, setActiveTicker] = useState('');
    const [language, setLanguage] = useState('English');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<WorkflowState | null>(null);

    // Autocomplete state
    const [tickers, setTickers] = useState<Ticker[]>([]);
    const [open, setOpen] = useState(false);
    const [tickerLoading, setTickerLoading] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Fetch tickers based on input
    useEffect(() => {
        if (!ticker) {
            setTickers([]);
            setTickerLoading(false);
            return;
        }

        const controller = new AbortController();
        const timeout = setTimeout(async () => {
            setTickerLoading(true);
            try {
                const res = await fetch(`/api/stocks?q=${encodeURIComponent(ticker)}`,
                    { signal: controller.signal }
                );
                if (res.ok) {
                    const data = await res.json();
                    setTickers(data);
                } else {
                    setTickers([]);
                }
            } catch (error) {
                if ((error as DOMException).name !== 'AbortError') {
                    console.error('Failed to fetch tickers:', error);
                }
            } finally {
                setTickerLoading(false);
            }
        }, 200);

        return () => {
            controller.abort();
            clearTimeout(timeout);
        };
    }, [ticker]);

    // Close suggestions when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleSearch = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!ticker) return;

        setOpen(false); // Close suggestions
        setActiveTicker(ticker.toUpperCase());
        setLoading(true);
        setResults(null);

        try {
            const data = await startTradingAnalysis(ticker.toUpperCase(), language);
            setResults(data);
        } catch (error) {
            console.error("Analysis failed", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectTicker = (currentValue: string) => {
        setTicker(currentValue.toUpperCase());
        setOpen(false);
        // Optional: auto-search on select? user might check language first.
        // Let's keep it manual trigger or trigger immediately? 
        // Instructions imply "fill" then "analyze". I'll just fill.
    };

    return (
        <div className="min-h-screen bg-background text-foreground p-8 font-sans transition-colors duration-300">
            {/* SEO Hidden H1 for Metadata structure */}
            <h1 className="sr-only">AI Trading Agents - Multi-Agent Stock Analysis</h1>

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

                    <h2 className="text-5xl md:text-6xl font-extrabold tracking-tight">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-cyan-500">
                            AI Agents
                        </span>
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto text-lg leading-relaxed">
                        Multi-Agent Financial Analysis System. Powered by LLMs.
                    </p>
                </div>

                {/* Search Bar & Language Selector */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <div className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto relative group items-start z-50">

                        {/* Language Selector */}
                        <div className="relative group/lang z-20 w-full md:w-auto h-14">
                            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-cyan-500 rounded-lg blur opacity-0 group-hover/lang:opacity-25 transition duration-500" />
                            <select
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                className="relative appearance-none h-14 w-full md:w-auto pl-10 pr-10 rounded-lg bg-card border border-border focus:border-primary cursor-pointer font-medium text-sm transition-all hover:bg-accent focus:ring-2 focus:ring-primary/20 min-w-[160px]"
                            >
                                {LANGUAGES.map(lang => (
                                    <option key={lang.code} value={lang.code}>{lang.flag} {lang.label}</option>
                                ))}
                            </select>
                            <Languages className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                <motion.div animate={{ rotate: 0 }} className="text-muted-foreground/50 text-xs">▼</motion.div>
                            </div>
                        </div>

                        {/* Search Input (Combobox) */}
                        <div
                            ref={wrapperRef}
                            className="relative flex-1 w-full"
                        >
                            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-cyan-500 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />

                            <div className="relative flex gap-2">
                                <div className="relative flex-1 bg-card border border-border focus-within:border-primary rounded-lg shadow-sm transition-all h-14 flex items-center overflow-visible">
                                    <Search className="absolute left-4 z-10 h-5 w-5 text-muted-foreground" />
                                    <Command
                                        shouldFilter={false} // We handle filtering via fuzzy match manually if needed, or stick to default. 
                                        // Actually, if we pass `tickers` to CommandList and filter there, we need shouldFilter=true (default). 
                                        // But if the list is huge (all US stocks ~10k), performant rendering might be an issue.
                                        // cmdk is usually fast.
                                        className="bg-transparent border-none overflow-visible"
                                    >
                                        <CommandInput
                                            placeholder="Enter Stock Ticker (e.g., NVDA)"
                                            value={ticker}
                                            onValueChange={(val) => {
                                                setTicker(val);
                                                setOpen(!!val);
                                            }}
                                            onFocus={() => {
                                                if (ticker) setOpen(true);
                                            }}
                                            className="pl-12 font-mono text-lg h-14 bg-transparent border-none focus:ring-0 w-full"
                                        />

                                        <AnimatePresence>
                                            {open && ticker.length > 0 && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10, height: 0 }}
                                                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                                                    exit={{ opacity: 0, y: 10, height: 0 }}
                                                    className="absolute top-[calc(100%+8px)] left-0 w-full bg-popover/95 backdrop-blur-md text-popover-foreground rounded-lg border border-border shadow-2xl z-50 overflow-hidden"
                                                >
                                                    <CommandList className="max-h-[300px] overflow-y-auto custom-scrollbar p-1">
                                                        <CommandEmpty className="p-4 text-sm text-muted-foreground text-center">
                                                            {tickerLoading ? "Loading tickers..." : "No results found."}
                                                        </CommandEmpty>
                                                        <CommandGroup>
                                                            {tickers
                                                                .filter(t => t.symbol.startsWith(ticker.toUpperCase()) || t.name.toLowerCase().includes(ticker.toLowerCase()))
                                                                .slice(0, 50) // Limit results for performance
                                                                .map((t) => (
                                                                    <CommandItem
                                                                        key={t.symbol}
                                                                        value={t.symbol}
                                                                        onSelect={handleSelectTicker}
                                                                        className="cursor-pointer aria-selected:bg-accent"
                                                                    >
                                                                        <div className="flex flex-col">
                                                                            <span className="font-bold text-base">{t.symbol}</span>
                                                                            <span className="text-xs text-muted-foreground truncate max-w-[200px]">{t.name}</span>
                                                                        </div>
                                                                    </CommandItem>
                                                                ))}
                                                        </CommandGroup>
                                                    </CommandList>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </Command>
                                </div>

                                <Button
                                    onClick={(e) => handleSearch(e)}
                                    disabled={loading}
                                    className="relative bg-primary hover:bg-primary/90 h-14 px-8 text-lg rounded-lg shadow-lg transition-all hover:scale-105 active:scale-95 text-primary-foreground z-10 shrink-0"
                                >
                                    {loading ? <Loader2 className="animate-spin" /> : "Analyze"}
                                </Button>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Workflow Explainer */}
                <AgentWorkflowExplainer collapsed={!!activeTicker || loading} />

                {/* Main Content Grid */}
                {(activeTicker || loading) && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                            {/* Column 1: Analysts */}
                            <div className="space-y-6 lg:col-span-1">
                                <h2 className="text-xl font-semibold text-slate-300 border-b border-slate-800 pb-2">Analyst Team</h2>

                                {loading && !results ? (
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

                                {/* Price Chart */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    <PriceChart ticker={activeTicker || ticker.toUpperCase()} />
                                </motion.div>

                                {loading && (!results || !results.reporter) ? (
                                    <div className="h-96 bg-slate-900/50 rounded-xl animate-pulse border border-slate-800 mt-6" />
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
