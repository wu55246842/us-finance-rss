'use client';

import { useState } from 'react';
import Editor from '@monaco-editor/react';
import { Button } from '@/components/ui/button';
import { Loader2, Play, AlertTriangle } from 'lucide-react';

const DEFAULT_CODE = `// Strategy: Select stocks with positive change and price > 100
// Available context: stock.symbol, stock.price, stock.changePercent, stock.volume, stock.marketCap

if (stock.price > 100 && stock.changePercent > 0) {
    return true;
}

return false;
`;

export default function QuantPage() {
    const [code, setCode] = useState(DEFAULT_CODE);
    const [isRunning, setIsRunning] = useState(false);
    const [results, setResults] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);

    const handleRun = async () => {
        setIsRunning(true);
        setError(null);
        setResults([]);

        try {
            const response = await fetch('/api/quant/run', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to execute strategy');
            }

            setResults(data.results || []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsRunning(false);
        }
    };

    return (
        <div className="container mx-auto p-4 md:p-6 max-w-7xl min-h-[calc(100vh-4rem)] flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Quant Playground</h1>
                    <p className="text-muted-foreground mt-1">
                        Write JavaScript to screen stocks in real-time.
                    </p>
                </div>
                <Button onClick={handleRun} disabled={isRunning} size="lg" className="gap-2">
                    {isRunning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                    Run Strategy
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">
                {/* Editor Panel */}
                <div className="flex flex-col gap-4 bg-card border border-border rounded-xl overflow-hidden shadow-sm h-[600px] lg:h-auto">
                    <div className="bg-muted/50 px-4 py-2 border-b border-border flex items-center justify-between">
                        <span className="text-sm font-medium">Strategy Editor (JavaScript)</span>
                        <div className="flex items-center gap-2 text-xs text-amber-500">
                            <AlertTriangle className="h-3 w-3" />
                            <span>Runs in sandbox</span>
                        </div>
                    </div>
                    <div className="flex-1 min-h-0">
                        <Editor
                            height="100%"
                            defaultLanguage="javascript"
                            value={code}
                            onChange={(value) => setCode(value || '')}
                            theme="vs-dark"
                            options={{
                                minimap: { enabled: false },
                                fontSize: 14,
                                scrollBeyondLastLine: false,
                                automaticLayout: true,
                            }}
                        />
                    </div>
                </div>

                {/* Results Panel */}
                <div className="flex flex-col gap-4 bg-card border border-border rounded-xl overflow-hidden shadow-sm h-[600px] lg:h-auto">
                    <div className="bg-muted/50 px-4 py-2 border-b border-border">
                        <span className="text-sm font-medium">Results ({results.length})</span>
                    </div>
                    <div className="flex-1 overflow-auto p-4">
                        {error && (
                            <div className="p-4 bg-red-500/10 text-red-500 rounded-lg border border-red-500/20 mb-4">
                                <strong>Error:</strong> {error}
                            </div>
                        )}

                        {results.length === 0 && !isRunning && !error && (
                            <div className="h-full flex flex-col items-center justify-center text-muted-foreground text-center p-8">
                                <Play className="h-12 w-12 mb-4 opacity-20" />
                                <p>Run your strategy to see matching stocks.</p>
                            </div>
                        )}

                        {isRunning && (
                            <div className="h-full flex items-center justify-center text-muted-foreground">
                                <Loader2 className="h-8 w-8 animate-spin mb-2" />
                                <span className="sr-only">Running...</span>
                            </div>
                        )}

                        <div className="space-y-3">
                            {results.map((stock, idx) => (
                                <div
                                    key={`quant-${stock.symbol}-${idx}`}
                                    className="flex items-center justify-between p-4 rounded-lg border border-border bg-background hover:bg-accent/50 transition-colors"
                                >
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-lg">{stock.symbol}</span>
                                            <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                                                {stock.type}
                                            </span>
                                        </div>
                                        <div className="text-sm text-muted-foreground">{stock.description}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-mono font-medium">${stock.price?.toFixed(2)}</div>
                                        <div className={`text-sm font-mono ${stock.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                            {stock.change >= 0 ? '+' : ''}{stock.change?.toFixed(2)}%
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
