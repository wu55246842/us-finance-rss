'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Bot, Share2, FileText, BrainCircuit } from 'lucide-react';

export function AgentWorkflowExplainer({ collapsed = false }: { collapsed?: boolean }) {
    const [isExpanded, setIsExpanded] = useState(!collapsed);

    return (
        <div className="w-full max-w-5xl mx-auto mb-8 transition-all duration-500">
            <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl overflow-hidden shadow-sm">

                {/* Header Toggle */}
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="w-full flex items-center justify-between p-4 hover:bg-accent/50 transition-colors"
                >
                    <div className="flex items-center gap-2">
                        <BrainCircuit className="text-primary" size={20} />
                        <h3 className="font-semibold text-foreground">How Multi-Agent Analysis Works</h3>
                    </div>
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>

                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="p-6 pt-0 border-t border-border">
                                <p className="text-muted-foreground mb-8 text-sm md:text-base max-w-3xl">
                                    Our system employs a sophisticated <strong>Mixture of Agents (MoA)</strong> architecture.
                                    Instead of a single AI model, we orchestrate a team of specialized agents that analyze data independently,
                                    debate their findings, and synthesize a comprehensive institutional-grade report.
                                </p>

                                {/* Visual Diagram */}
                                <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-0 max-w-4xl mx-auto py-8">

                                    {/* Connecting Line (Desktop) */}
                                    <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-border via-primary/50 to-border -z-10" />

                                    {/* Step 1: Input */}
                                    <div className="flex flex-col items-center bg-card z-10 p-2">
                                        <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center border border-blue-500/20 mb-3 shadow-lg shadow-blue-500/10">
                                            <Share2 size={24} />
                                        </div>
                                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground text-center">Input &<br />Config</span>
                                    </div>

                                    {/* Step 2: Parallel Agents */}
                                    <div className="flex flex-col items-center bg-card z-10 p-2">
                                        <div className="flex gap-2 mb-3">
                                            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20" title="Technical Agent">
                                                <Bot size={20} />
                                            </div>
                                            <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20" title="Fundamental Agent">
                                                <Bot size={20} />
                                            </div>
                                            <div className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center border border-purple-500/20" title="Sentiment Agent">
                                                <Bot size={20} />
                                            </div>
                                        </div>
                                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground text-center">Specialized<br />Analysts</span>
                                    </div>

                                    {/* Step 3: Synthesis */}
                                    <div className="flex flex-col items-center bg-card z-10 p-2">
                                        <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center border border-indigo-500/20 mb-3 shadow-lg shadow-indigo-500/10">
                                            <BrainCircuit size={24} />
                                        </div>
                                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground text-center">Debate &<br />Synthesis</span>
                                    </div>

                                    {/* Step 4: Output */}
                                    <div className="flex flex-col items-center bg-card z-10 p-2">
                                        <div className="w-12 h-12 rounded-xl bg-fuchsia-500/10 text-fuchsia-500 flex items-center justify-center border border-fuchsia-500/20 mb-3 shadow-lg shadow-fuchsia-500/10">
                                            <FileText size={24} />
                                        </div>
                                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground text-center">Final<br />Report</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                                    <div className="p-4 rounded-xl bg-accent/30 border border-border/50">
                                        <h4 className="font-medium mb-1 text-sm text-foreground">1. Parallel Analysis</h4>
                                        <p className="text-xs text-muted-foreground">Three distinct AI agents analyze the chart, financials, and news simultaneously and independently.</p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-accent/30 border border-border/50">
                                        <h4 className="font-medium mb-1 text-sm text-foreground">2. Synthesis & Debate</h4>
                                        <p className="text-xs text-muted-foreground">A 'Researcher' agent reviews all reports, identifies conflicts (e.g., Bullish Chart vs Bearish News), and synthesizes truth.</p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-accent/30 border border-border/50">
                                        <h4 className="font-medium mb-1 text-sm text-foreground">3. Final Verdict</h4>
                                        <p className="text-xs text-muted-foreground">The 'Reporter' agent drafts a clean, actionable investment memo based on the synthesized research.</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
