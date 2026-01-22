'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Share2,
    Copy,
    MessageCircle,
    Send,
    Linkedin,
    Facebook,
    Check,
    X
} from 'lucide-react';
import { clsx } from 'clsx';

interface ShareMenuProps {
    title: string;
    url?: string;
}

export function ShareMenu({ title, url }: ShareMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const [shareUrl, setShareUrl] = useState('');

    useEffect(() => {
        setShareUrl(url || window.location.href);
    }, [url]);

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    const shareLinks = [
        {
            name: 'X (Twitter)',
            icon: <X size={18} />,
            url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(shareUrl)}`,
            color: 'hover:bg-black hover:text-white',
        },
        {
            name: 'LinkedIn',
            icon: <Linkedin size={18} />,
            url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
            color: 'hover:bg-[#0077b5] hover:text-white',
        },
        {
            name: 'Facebook',
            icon: <Facebook size={18} />,
            url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
            color: 'hover:bg-[#1877f2] hover:text-white',
        },
        {
            name: 'WhatsApp',
            icon: <MessageCircle size={18} />,
            url: `https://wa.me/?text=${encodeURIComponent(title + ' ' + shareUrl)}`,
            color: 'hover:bg-[#25d366] hover:text-white',
        },
        {
            name: 'Telegram',
            icon: <Send size={18} />,
            url: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(title)}`,
            color: 'hover:bg-[#0088cc] hover:text-white',
        },
    ];

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-2.5 text-sm font-bold shadow-sm transition-all hover:bg-accent hover:border-primary/50"
            >
                <Share2 size={18} className="text-primary" />
                Share
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <div
                            className="fixed inset-0 z-40 bg-transparent"
                            onClick={() => setIsOpen(false)}
                        />

                        {/* Menu */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="absolute bottom-full left-0 mb-4 z-50 w-64 overflow-hidden rounded-2xl border border-border bg-background/90 backdrop-blur-xl shadow-2xl"
                        >
                            <div className="p-2 space-y-1">
                                {shareLinks.map((link) => (
                                    <a
                                        key={link.name}
                                        href={link.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={clsx(
                                            "flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-bold transition-all",
                                            link.color
                                        )}
                                        onClick={() => setIsOpen(false)}
                                    >
                                        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted text-foreground group-hover:bg-transparent">
                                            {link.icon}
                                        </div>
                                        {link.name}
                                    </a>
                                ))}

                                <div className="h-px bg-border my-2 mx-4" />

                                <button
                                    onClick={handleCopyLink}
                                    className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-bold transition-all hover:bg-primary hover:text-primary-foreground"
                                >
                                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted text-foreground">
                                        {copied ? <Check size={18} className="text-emerald-500" /> : <Copy size={18} />}
                                    </div>
                                    {copied ? 'Copied!' : 'Copy Link'}
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
