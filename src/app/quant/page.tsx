'use client';

import { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Play, Sparkles, Bot, Search } from 'lucide-react';
import { BacktestChart } from '@/components/quant/BacktestChart';

const DEFAULT_CODE = `// Strategy: Buy if Price > 200 SMA and RSI < 30
// Available: bar, position, sma(p), rsi(p), bb(p, k)

const ma = sma(200);
const r = rsi(14);

// Buy Condition
if (bar.close > ma && r < 30) {
    return 'BUY';
}

// Sell Condition
if (bar.close < ma) {
    return 'SELL';
}
`;

const TICKER_OPTIONS = {
    "Indices": [
        { label: "S&P 500", value: "^GSPC" },
        { label: "Nasdaq 100", value: "^NDX" },
        { label: "Dow Jones", value: "^DJI" },
        { label: "Russell 2000", value: "^RUT" },
    ],
    "Tech Giants": [
        { label: "NVIDIA", value: "NVDA" },
        { label: "Apple", value: "AAPL" },
        { label: "Microsoft", value: "MSFT" },
        { label: "Google", value: "GOOGL" },
        { label: "Amazon", value: "AMZN" },
        { label: "Tesla", value: "TSLA" },
        { label: "Meta", value: "META" },
    ],
    "Crypto": [
        { label: "Bitcoin", value: "BTC-USD" },
        { label: "Ethereum", value: "ETH-USD" },
        { label: "Solana", value: "SOL-USD" },
    ],
    "Semiconductors": [
        { label: "AMD", value: "AMD" },
        { label: "Intel", value: "INTC" },
        { label: "TSMC", value: "TSM" },
        { label: "Broadcom", value: "AVGO" },
    ],
    "Finance": [
        { label: "JPMorgan", value: "JPM" },
        { label: "Goldman Sachs", value: "GS" },
        { label: "Visa", value: "V" },
    ]
};

export default function QuantPage() {
    // State
    const [ticker, setTicker] = useState('^GSPC');
    const [history, setHistory] = useState<any[]>([]);
    const [code, setCode] = useState(DEFAULT_CODE);
    const [markers, setMarkers] = useState<any[]>([]);
    const [logs, setLogs] = useState<any[]>([]);
    const [overlays, setOverlays] = useState<any[]>([]);
    const [panes, setPanes] = useState<any[]>([]);
    const [loadingData, setLoadingData] = useState(false);

    // AI State
    const [aiPrompt, setAiPrompt] = useState('Buy when RSI < 30 and Price > SMA200');
    const [isGenerating, setIsGenerating] = useState(false);

    // Fetch History when ticker changes
    useEffect(() => {
        if (!ticker) return;

        // Reset Run State
        setMarkers([]);
        setLogs([]);
        setOverlays([]);
        setPanes([]);

        setLoadingData(true);
        // Fetch max available history (10y)
        fetch(`/api/market/history?symbol=${encodeURIComponent(ticker)}&range=10y`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    data.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
                    setHistory(data);
                } else {
                    console.error("Invalid data", data);
                    setHistory([]);
                }
            })
            .catch(err => console.error(err))
            .finally(() => setLoadingData(false));
    }, [ticker]);

    // Client-Side Execution Engine
    const handleRun = () => {
        if (history.length === 0) return;
        setMarkers([]);
        setLogs([]);
        setOverlays([]);
        setPanes([]);

        try {
            let currentIndex = 0;
            const contextData = history;
            const traceStore: Record<string, any[]> = {};

            const addTrace = (name: string, value: number | null | undefined) => {
                if (!traceStore[name]) traceStore[name] = [];
                if (value !== null && value !== undefined && !isNaN(value)) {
                    traceStore[name].push({ time: contextData[currentIndex].time, value });
                }
            };

            const helpers = {
                sma: (period: number) => {
                    if (currentIndex < period - 1) return NaN;
                    let sum = 0;
                    for (let k = 0; k < period; k++) sum += contextData[currentIndex - k].close;
                    const val = sum / period;
                    addTrace(`SMA ${period}`, val);
                    return val;
                },
                rsi: (period: number) => {
                    if (currentIndex < period) return NaN;
                    let gains = 0, losses = 0;
                    for (let k = 1; k <= period; k++) {
                        const change = contextData[currentIndex - k + 1].close - contextData[currentIndex - k].close;
                        if (change > 0) gains += change; else losses += Math.abs(change);
                    }
                    if (losses === 0) return 100;
                    const rs = gains / losses;
                    const val = 100 - (100 / (1 + rs));
                    addTrace(`RSI ${period}`, val);
                    return val;
                },
                bb: (period: number = 20, mult: number = 2) => {
                    if (currentIndex < period - 1) return { middle: NaN, upper: NaN, lower: NaN };
                    let sum = 0;
                    for (let k = 0; k < period; k++) sum += contextData[currentIndex - k].close;
                    const middle = sum / period;

                    let sqSum = 0;
                    for (let k = 0; k < period; k++) {
                        sqSum += Math.pow(contextData[currentIndex - k].close - middle, 2);
                    }
                    const std = Math.sqrt(sqSum / period);
                    const upper = middle + mult * std;
                    const lower = middle - mult * std;

                    addTrace(`BB Upper ${period}`, upper);
                    addTrace(`BB Lower ${period}`, lower);
                    return { middle, upper, lower };
                },
                macd: (fast: number = 12, slow: number = 26, smooth: number = 9) => {
                    // Placeholder for macd
                    return { macd: 0, signal: 0, histogram: 0 };
                }
            };

            const userStrategy = new Function('bar', 'position', 'sma', 'rsi', 'bb', 'macd', `
                try {
                    ${code}
                } catch(e) { return null; }
            `);

            let position = 0;
            const newMarkers: any[] = [];
            const tradeLogs: any[] = [];

            for (let i = 0; i < history.length; i++) {
                currentIndex = i;
                const bar = history[i];

                const signal = userStrategy(
                    bar,
                    position,
                    helpers.sma,
                    helpers.rsi,
                    helpers.bb,
                    helpers.macd
                );

                if (signal === 'BUY' && position === 0) {
                    position = 1;
                    newMarkers.push({ time: bar.time, position: 'belowBar', color: '#2196F3', shape: 'arrowUp', text: 'BUY' });
                    tradeLogs.push({ date: bar.time, type: 'BUY', price: bar.close });
                } else if (signal === 'SELL' && position === 1) {
                    position = 0;
                    newMarkers.push({ time: bar.time, position: 'aboveBar', color: '#E91E63', shape: 'arrowDown', text: 'SELL' });
                    tradeLogs.push({ date: bar.time, type: 'SELL', price: bar.close });
                }
            }

            setMarkers(newMarkers);
            setLogs(tradeLogs.reverse());

            const newOverlays: any[] = [];
            const newPanes: any[] = [];

            Object.entries(traceStore).forEach(([name, data]) => {
                if (name.startsWith('SMA') || name.startsWith('BB')) {
                    newOverlays.push({
                        name,
                        type: 'Line',
                        data: data,
                        color: name.includes('Upper') ? '#4caf50' : name.includes('Lower') ? '#ef5350' : '#2962FF',
                        lineWidth: 1
                    });
                } else if (name.startsWith('RSI')) {
                    newPanes.push({
                        id: name,
                        height: 150,
                        series: [{ name, type: 'Line', data, color: '#d946ef' }]
                    });
                }
            });

            setOverlays(newOverlays);
            setPanes(newPanes);

        } catch (e: any) {
            console.error("Execution Error:", e);
            alert("Error in strategy code: " + e.message);
        }
    };

    // AI Generation Handler
    const handleAiGenerate = async () => {
        if (!aiPrompt) return;
        setIsGenerating(true);
        try {
            const res = await fetch('/api/quant/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: aiPrompt })
            });
            const data = await res.json();
            if (data.code) {
                setCode(data.code);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="container mx-auto p-4 md:p-6 max-w-[1600px] min-h-[calc(100vh-4rem)] flex flex-col gap-6">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-cyan-400">
                        Quant Studio
                    </h1>
                    <p className="text-muted-foreground">
                        AI-Powered Client-Side Backtesting
                    </p>
                </div>

                {/* Ticker Selector */}
                <div className="flex items-center gap-2 bg-card border border-border p-1.5 rounded-lg shadow-sm">
                    <Search className="text-muted-foreground ml-2" size={16} />
                    <Input
                        value={ticker}
                        onChange={(e) => setTicker(e.target.value.toUpperCase())}
                        className="border-0 h-8 w-24 focus-visible:ring-0 font-mono font-bold"
                        placeholder="SYMBOL"
                    />

                    <select
                        className="h-8 text-xs bg-transparent border-l border-border pl-2 outline-none text-muted-foreground max-w-[120px] cursor-pointer"
                        onChange={(e) => { if (e.target.value) setTicker(e.target.value); }}
                        value=""
                    >
                        <option value="" disabled>Select Preset...</option>
                        {Object.entries(TICKER_OPTIONS).map(([category, items]) => (
                            <optgroup label={category} key={category}>
                                {items.map(item => (
                                    <option key={item.value} value={item.value}>
                                        {item.label}
                                    </option>
                                ))}
                            </optgroup>
                        ))}
                    </select>

                    <Button size="sm" variant="ghost" className="h-8 text-xs text-muted-foreground hidden md:flex" onClick={() => setTicker('^GSPC')}>SPX</Button>
                    <Button size="sm" variant="ghost" className="h-8 text-xs text-muted-foreground hidden md:flex" onClick={() => setTicker('BTC-USD')}>BTC</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">

                {/* LEFT COLUMN: Editor & AI (4cols) */}
                <div className="lg:col-span-4 flex flex-col gap-4">

                    {/* AI Prompt Box */}
                    <div className="bg-card border border-border rounded-xl p-4 shadow-sm flex flex-col gap-2 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500" />
                        <div className="flex items-center gap-2 text-primary font-medium">
                            <Bot size={18} />
                            <span>AI Strategy Generator</span>
                        </div>
                        <Input
                            placeholder="e.g. Buy when RSI < 30 and Price > SMA200..."
                            value={aiPrompt}
                            onChange={(e) => setAiPrompt(e.target.value)}
                            className="bg-accent/20"
                        />
                        <Button
                            onClick={handleAiGenerate}
                            disabled={isGenerating || !aiPrompt}
                            variant="secondary"
                            className="w-full gap-2 relative"
                        >
                            {isGenerating ? <Loader2 className="animate-spin h-4 w-4" /> : <Sparkles className="h-4 w-4 text-purple-400" />}
                            Generate Code
                        </Button>
                    </div>

                    {/* Code Editor */}
                    <div className="flex-1 bg-card border border-border rounded-xl local overflow-hidden shadow-sm flex flex-col">
                        <div className="bg-muted/30 px-4 py-2 border-b border-border flex items-center justify-between">
                            <span className="text-xs font-mono text-muted-foreground">strategy.js</span>
                            <Button size="sm" onClick={handleRun} disabled={loadingData || history.length === 0} className="h-7 text-xs gap-1 bg-green-600 hover:bg-green-700 text-white border-0">
                                <Play size={12} fill="currentColor" /> Run
                            </Button>
                        </div>
                        <Editor
                            height="100%"
                            defaultLanguage="javascript"
                            value={code}
                            onChange={(val) => setCode(val || '')}
                            theme="vs-dark"
                            options={{ minimap: { enabled: false }, fontSize: 13, padding: { top: 16 } }}
                        />
                    </div>
                </div>

                {/* RIGHT COLUMN: Results / Chart (8cols) */}
                <div className="lg:col-span-8 flex flex-col gap-4">
                    <BacktestChart symbol={ticker} markers={markers} overlays={overlays} panes={panes} data={history} />

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-card border border-border p-4 rounded-xl">
                            <div className="text-xs text-muted-foreground uppercase">Data Points</div>
                            <div className="text-2xl font-mono font-bold">{history.length}</div>
                        </div>
                        <div className="bg-card border border-border p-4 rounded-xl">
                            <div className="text-xs text-muted-foreground uppercase">Trades</div>
                            <div className="text-2xl font-mono font-bold">{logs.length}</div>
                        </div>
                    </div>

                    <div className="flex-1 bg-card border border-border rounded-xl p-4 overflow-auto max-h-[300px]">
                        <h3 className="text-sm font-medium mb-2 sticky top-0 bg-card z-10">Trade Log</h3>
                        <table className="w-full text-sm text-left">
                            <thead className="text-muted-foreground">
                                <tr className="border-b border-border/50">
                                    <th className="py-2">Date</th>
                                    <th className="py-2">Action</th>
                                    <th className="py-2 text-right">Price</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.map((log, i) => (
                                    <tr key={i} className="border-b border-border/10 hover:bg-accent/10">
                                        <td className="py-1 font-mono text-muted-foreground">{log.date}</td>
                                        <td className={log.type === 'BUY' ? 'text-green-500 font-bold' : 'text-red-500 font-bold'}>{log.type}</td>
                                        <td className="text-right font-mono">${log.price.toFixed(2)}</td>
                                    </tr>
                                ))}
                                {logs.length === 0 && (
                                    <tr>
                                        <td colSpan={3} className="py-8 text-center text-muted-foreground">No trades executed.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
