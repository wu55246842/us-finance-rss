'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';
import { Languages } from 'lucide-react';

interface BlogPostContentProps {
    content: string;
    chineseContent?: string;
}

export function BlogPostContent({ content, chineseContent }: BlogPostContentProps) {
    const [language, setLanguage] = useState<'en' | 'zh'>('en');

    // If no chinese content, force english or hide toggle
    const hasChinese = !!chineseContent && chineseContent.trim().length > 0;

    const displayContent = language === 'zh' && hasChinese ? chineseContent : content;

    return (
        <div className="space-y-8">
            {/* Language Toggle */}
            {hasChinese && (
                <div className="flex justify-end">
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
                </div>
            )}

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
