'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, TrendingUp, TrendingDown, BarChart2, Radio } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Message {
    id?: number;
    agentName: string;
    agentRole: 'bull' | 'bear' | 'analyst';
    content: string;
    createdAt?: string;
}

interface Thread {
    id: number;
    topic: string;
    summary: string;
    createdAt: string;
}

export function AgentDiscussion() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [displayedMessages, setDisplayedMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false); // Initial load
    const [isUpdating, setIsUpdating] = useState(false); // Background update
    const [thread, setThread] = useState<Thread | null>(null);
    const [currentTyping, setCurrentTyping] = useState<string | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Fetch Latest Data
    const fetchLatest = async (isBackground = false) => {
        if (!isBackground) setLoading(true);
        else setIsUpdating(true);

        try {
            // 1. Try to generate a new turn if needed (throttled backend)
            await fetch('/api/quant/discussion', { method: 'POST' });

            // 2. Fetch the updated conversation
            const res = await fetch('/api/quant/discussion');
            if (res.ok) {
                const data = await res.json();
                if (data.thread) {
                    setThread(data.thread);

                    // Only update if we have new messages
                    setMessages(prev => {
                        if (data.messages.length > prev.length) {
                            return data.messages;
                        }
                        return prev;
                    });

                    // If it's the first load, show everything immediately
                    if (!isBackground && displayedMessages.length === 0) {
                        setDisplayedMessages(data.messages);
                    }
                }
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
            setIsUpdating(false);
        }
    };

    // Initial Load
    useEffect(() => {
        fetchLatest();
    }, []);

    // Polling every 60s to check for new turns
    useEffect(() => {
        const interval = setInterval(() => {
            fetchLatest(true);
        }, 60000); // 1 minute
        return () => clearInterval(interval);
    }, []);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [displayedMessages, currentTyping]);

    // Sequential Reveal Effect for NEW messages
    useEffect(() => {
        if (messages.length === 0) return;

        // If we simply have more messages than displayed
        if (messages.length > displayedMessages.length) {
            const nextIndex = displayedMessages.length;
            const nextMsg = messages[nextIndex];

            setCurrentTyping(nextMsg.agentName);

            // Simulate typing delay
            const delay = 1500 + Math.random() * 1000;
            const timeout = setTimeout(() => {
                setDisplayedMessages(prev => [...prev, nextMsg]);
                setCurrentTyping(null);
            }, delay);

            return () => clearTimeout(timeout);
        }
    }, [messages, displayedMessages]);


    const getAgentIcon = (role: string) => {
        switch (role) {
            case 'bull': return <TrendingUp className="h-6 w-6 text-green-500" />;
            case 'bear': return <TrendingDown className="h-6 w-6 text-red-500" />;
            case 'analyst': return <BarChart2 className="h-6 w-6 text-blue-500" />;
            default: return <BarChart2 className="h-6 w-6" />;
        }
    };

    const getAgentColor = (role: string) => {
        switch (role) {
            case 'bull': return 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-900';
            case 'bear': return 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900';
            case 'analyst': return 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-900';
            default: return 'bg-gray-50';
        }
    };

    return (
        <Card className="w-full border-none shadow-none md:border md:shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
                <div className="flex items-center gap-2">
                    <Radio className={`h-4 w-4 ${isUpdating ? 'text-green-500 animate-pulse' : 'text-gray-400'}`} />
                    <CardTitle className="text-lg font-bold">Live Feed</CardTitle>
                </div>
                {thread && (
                    <Badge variant="outline" className="text-xs font-normal">
                        {new Date().toLocaleDateString()}
                    </Badge>
                )}
            </CardHeader>
            <CardContent className="p-0 md:p-6">
                <div ref={scrollRef} className="space-y-6 max-h-[70vh] overflow-y-auto px-4 py-4 md:px-0">
                    {loading && messages.length === 0 && (
                        <div className="flex justify-center py-10">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    )}

                    {displayedMessages.length === 0 && !loading && (
                        <div className="text-center text-muted-foreground py-8">
                            Waiting for the market to open...
                        </div>
                    )}

                    {displayedMessages.map((msg, i) => (
                        <div key={i} className={`flex gap-3 ${msg.agentRole === 'bull' ? 'flex-row-reverse' : ''} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                            <div className={`mt-1 flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-full border bg-background shadow-sm z-10`}>
                                {getAgentIcon(msg.agentRole)}
                            </div>
                            <div className={`flex flex-col max-w-[85%] ${msg.agentRole === 'bull' ? 'items-end' : 'items-start'}`}>
                                <div className="flex items-baseline gap-2 mb-1">
                                    <span className="text-xs font-medium text-foreground">{msg.agentName}</span>
                                    <span className="text-[10px] text-muted-foreground">
                                        {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                    </span>
                                </div>
                                <div className={`px-4 py-3 rounded-2xl text-sm border shadow-sm ${getAgentColor(msg.agentRole)}`}>
                                    {msg.content}
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Typing Indicator */}
                    {(currentTyping) && (
                        <div className="flex gap-3 items-center animate-in fade-in duration-300 ml-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted/50">
                                <span className="text-xs">...</span>
                            </div>
                            <span className="text-xs text-muted-foreground italic">
                                {currentTyping} is typing...
                            </span>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
