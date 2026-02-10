'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, TrendingUp, TrendingDown, BarChart2, Radio, History, Languages } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

interface Message {
    id: number;
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

const LANGUAGES = [
    { code: 'en', name: 'English' },
    { code: 'zh', name: '简体中文' },
    { code: 'ja', name: '日本語' },
    { code: 'ko', name: '한국어' },
];

export function AgentDiscussion() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [displayedMessages, setDisplayedMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false); // Initial load
    const [isUpdating, setIsUpdating] = useState(false); // Background update
    const [thread, setThread] = useState<Thread | null>(null);
    const [currentTyping, setCurrentTyping] = useState<string | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Features State
    const [language, setLanguage] = useState('en');
    const [translations, setTranslations] = useState<Record<string, string>>({});
    const [historyOpen, setHistoryOpen] = useState(false);
    const [historyThreads, setHistoryThreads] = useState<Thread[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    // Fetch Latest Data
    const fetchLatest = async (isBackground = false) => {
        if (!isBackground) setLoading(true);
        else setIsUpdating(true);

        try {
            // 1. Try to generate a new turn if needed (throttled backend)
            // Only trigger generation if we are on the LATEST thread (no specific thread loaded from history)
            // checks if we are viewing history by comparing dates effectively, but simpler:
            // if we just loaded a specific thread from history, we might want to pause auto-updates or just let them happen 
            // but only if that thread IS the today's thread.
            // For now, simple logic: only trigger generation if we haven't manually loaded a past thread?
            // Actually, let's just trigger it. The backend handles finding "today's" thread.
            await fetch('/api/quant/discussion', { method: 'POST' });

            // 2. Fetch the updated conversation
            const res = await fetch('/api/quant/discussion');
            if (res.ok) {
                const data = await res.json();
                if (data.thread) {
                    // Only update if we are NOT viewing an old history thread different from today's
                    // But we don't track "viewing history" state explicitly yet other than `thread` state.
                    // If current `thread` state id is different from `data.thread.id`, we might be viewing history.
                    // Let's assume if user opened history, they selected a thread.

                    const isSameThread = thread ? thread.id === data.thread.id : true;
                    if (isSameThread) {
                        setThread(data.thread);
                        setMessages(prev => {
                            if (data.messages.length > prev.length) {
                                return data.messages;
                            }
                            return prev;
                        });
                        if (!isBackground && displayedMessages.length === 0) {
                            setDisplayedMessages(data.messages);
                        }
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

    // Load History Threads
    const loadHistory = async () => {
        setLoadingHistory(true);
        try {
            const res = await fetch('/api/quant/history');
            if (res.ok) {
                const data = await res.json();
                setHistoryThreads(data);
            }
        } finally {
            setLoadingHistory(false);
        }
    };

    // Load Specific Thread
    const selectThread = async (t: Thread) => {
        setHistoryOpen(false);
        setLoading(true);
        setDisplayedMessages([]); // Clear current view
        setMessages([]);
        try {
            const res = await fetch(`/api/quant/history?threadId=${t.id}`);
            if (res.ok) {
                const msgs = await res.json();
                setThread(t);
                setMessages(msgs);
                setDisplayedMessages(msgs); // Show immediately, no typing effect for history
            }
        } finally {
            setLoading(false);
        }
    };

    // Translation Effect
    useEffect(() => {
        if (language === 'en') return;

        const translateBatches = async () => {
            // Find messages that need translation
            const toTranslate = displayedMessages.filter(m => {
                const key = `${m.id}-${language}`;
                return !translations[key];
            });

            if (toTranslate.length === 0) return;

            // Translate one by one for now (could be batched)
            for (const msg of toTranslate) {
                const key = `${msg.id}-${language}`;
                // Set a placeholder to avoid double fetching
                setTranslations(prev => ({ ...prev, [key]: 'Translating...' }));

                try {
                    const res = await fetch('/api/quant/translate', {
                        method: 'POST',
                        body: JSON.stringify({ text: msg.content, targetLang: language }),
                    });
                    const data = await res.json();
                    if (data.translatedText) {
                        setTranslations(prev => ({ ...prev, [key]: data.translatedText }));
                    } else {
                        setTranslations(prev => ({ ...prev, [key]: msg.content })); // Fallback
                    }
                } catch (e) {
                    setTranslations(prev => ({ ...prev, [key]: msg.content })); // Fallback
                }
            }
        };

        const timeout = setTimeout(translateBatches, 500); // Debounce slightly
        return () => clearTimeout(timeout);
    }, [displayedMessages, language, translations]);


    // Initial Load
    useEffect(() => {
        fetchLatest();
    }, []);

    // Polling every 60s
    useEffect(() => {
        const interval = setInterval(() => {
            // Only poll if we are watching the latest thread? 
            // Or just poll and let `fetchLatest` decide?
            // Ideally we check if `thread` is today's thread.
            // For simplicity, just poll.
            fetchLatest(true);
        }, 60000);
        return () => clearInterval(interval);
    }, [thread]);

    // Auto-scroll
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [displayedMessages, currentTyping, language, translations]);

    // Reveal Effect
    useEffect(() => {
        if (messages.length === 0) return;
        if (messages.length > displayedMessages.length) {
            const nextIndex = displayedMessages.length;
            const nextMsg = messages[nextIndex];
            setCurrentTyping(nextMsg.agentName);
            const delay = 1000 + Math.random() * 1000;
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
                <div className="flex items-center gap-2">
                    {/* Language Selector */}
                    <div className="flex items-center border rounded-md px-2 py-1 text-xs bg-background">
                        <Languages className="h-3 w-3 mr-2 text-muted-foreground" />
                        <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            className="bg-transparent outline-none cursor-pointer"
                        >
                            {LANGUAGES.map(l => (
                                <option key={l.code} value={l.code}>{l.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* History Button */}
                    <Dialog open={historyOpen} onOpenChange={(open) => {
                        setHistoryOpen(open);
                        if (open) loadHistory();
                    }}>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="h-8 gap-1">
                                <History className="h-3 w-3" />
                                History
                            </Button>
                        </DialogTrigger>
                        <DialogContent className='max-h-[80vh] overflow-y-auto'>
                            <DialogHeader>
                                <DialogTitle>Past Discussions</DialogTitle>
                                <DialogDescription>Review daily recaps and AI debates.</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-2 mt-4">
                                {loadingHistory ? (
                                    <div className="flex justify-center py-4"><Loader2 className="animate-spin h-5 w-5" /></div>
                                ) : (
                                    historyThreads.map(t => (
                                        <div
                                            key={t.id}
                                            className={`p-3 rounded-lg border cursor-pointer hover:bg-accent ${thread?.id === t.id ? 'bg-accent border-primary' : ''}`}
                                            onClick={() => selectThread(t)}
                                        >
                                            <div className="font-medium text-sm">{t.topic}</div>
                                            <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{t.summary}</div>
                                            <div className="text-[10px] text-muted-foreground mt-2 text-right">
                                                {new Date(t.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
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
                                    {language === 'en' ? msg.content : (translations[`${msg.id}-${language}`] || msg.content)}
                                    {language !== 'en' && !translations[`${msg.id}-${language}`] && (
                                        <span className="ml-2 inline-block h-1 w-1 bg-current rounded-full animate-bounce" />
                                    )}
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
