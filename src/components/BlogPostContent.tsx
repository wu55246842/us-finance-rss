'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';
import { Languages, Loader2, Sparkles } from 'lucide-react';

interface BlogPostContentProps {
    content: string;
    chineseContent?: string;
}

export function BlogPostContent({ content, chineseContent }: BlogPostContentProps) {
    const [language, setLanguage] = useState<'en' | 'zh'>('en');
    const [aiChinese, setAiChinese] = useState<string | null>(null);
    const [isTranslating, setIsTranslating] = useState(false);

    // Check if we have pre-rendered or AI-generated Chinese content
    const hasChinese = (!!chineseContent && chineseContent.trim().length > 0) || !!aiChinese;

    const handleTranslate = async () => {
        if (hasChinese && !aiChinese) {
            setLanguage('zh');
            return;
        }

        setIsTranslating(true);
        try {
            const res = await fetch('/api/blog/translate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content })
            });

            if (!res.ok) throw new Error('Translation failed');
            const data = await res.json();
            setAiChinese(data.translatedText);
            setLanguage('zh');
        } catch (error) {
            console.error('AI Translation error:', error);
            alert('AI Translation failed. Please try again later.');
        } finally {
            setIsTranslating(false);
        }
    };

    const displayContent = language === 'zh'
        ? (aiChinese || (hasChinese ? chineseContent : content))
        : content;

    return (
        <div className="space-y-8">
            {/* Language Toggle & Translation Button */}
            <div className="flex justify-end gap-3">
                {!hasChinese && (
                    <button
                        onClick={handleTranslate}
                        disabled={isTranslating}
                        className="flex items-center gap-2 px-4 py-1.5 text-sm font-bold rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg hover:shadow-indigo-500/20 transition-all hover:scale-105 disabled:opacity-50 disabled:grayscale"
                    >
                        {isTranslating ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Sparkles className="h-4 w-4" />
                        )}
                        {isTranslating ? 'AI Translating...' : 'AI Translate to Chinese'}
                    </button>
                )}

                {hasChinese && (
                    <div className="inline-flex items-center rounded-lg border border-border bg-card p-1 shadow-sm">
                        <button
                            onClick={() => setLanguage('en')}
                            className={cn(
                                "flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-all",
                                language === 'en'
                                    ? "bg-primary text-primary-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                            )}
                        >
                            <span className="font-bold">EN</span> English
                        </button>
                        <button
                            onClick={() => setLanguage('zh')}
                            className={cn(
                                "flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-all",
                                language === 'zh'
                                    ? "bg-primary text-primary-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                            )}
                        >
                            <Languages size={14} />
                            <span className="font-bold">中文</span> Chinese
                        </button>
                    </div>
                )}
            </div>

            {/* Markdown Content */}
            <div className="prose prose-lg dark:prose-invert max-w-none text-foreground/90 leading-relaxed">
                <ReactMarkdown
                    components={{
                        p: ({ children }) => <p className="mb-6 text-lg">{children}</p>,
                        h1: ({ children }) => <h1 className="text-3xl font-bold mt-12 mb-6">{children}</h1>,
                        h2: ({ children }) => <h2 className="text-2xl font-bold mt-10 mb-4">{children}</h2>,
                        h3: ({ children }) => <h3 className="text-xl font-bold mt-8 mb-3">{children}</h3>,
                        ul: ({ children }) => <ul className="list-disc pl-6 mb-6 space-y-2">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal pl-6 mb-6 space-y-2">{children}</ol>,
                        li: ({ children }) => <li className="text-lg">{children}</li>,
                        strong: ({ children }) => <strong className="font-bold text-foreground">{children}</strong>,
                        blockquote: ({ children }) => (
                            <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground my-6">
                                {children}
                            </blockquote>
                        ),
                    }}
                >
                    {displayContent}
                </ReactMarkdown>
            </div>
        </div>
    );
}
