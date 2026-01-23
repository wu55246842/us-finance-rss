'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Check, ArrowRight } from 'lucide-react';

export function Newsletter() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setStatus('loading');
        // Simulate API call
        setTimeout(() => {
            setStatus('success');
            setEmail('');
        }, 1500);
    };

    return (
        <section className="relative overflow-hidden rounded-[2.5rem] bg-foreground text-background p-8 md:p-16 my-16">
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px]" />
            <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px]" />

            <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-background/10 border border-background/20 text-sm font-medium">
                    <Mail size={16} />
                    Market Intelligence
                </div>

                <div className="space-y-4">
                    <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
                        Institutional Research <br className="hidden md:block" />
                        <span className="text-primary italic">Delivered to your Inbox.</span>
                    </h2>
                    <p className="text-background/60 text-lg md:text-xl max-w-2xl mx-auto">
                        Join 50,000+ professionals who receive our weekly macro breakdown and market sentiment analysis.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="max-w-md mx-auto">
                    <div className="relative group">
                        <input
                            type="email"
                            required
                            placeholder="Email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={status !== 'idle'}
                            className="w-full pl-6 pr-32 py-5 rounded-2xl bg-background/5 border border-background/10 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-background placeholder:text-background/30"
                        />
                        <button
                            type="submit"
                            disabled={status !== 'idle'}
                            className="absolute right-2 top-2 bottom-2 px-6 rounded-xl bg-primary text-primary-foreground font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:scale-100 flex items-center gap-2"
                        >
                            {status === 'loading' ? (
                                <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                            ) : status === 'success' ? (
                                <Check size={18} />
                            ) : (
                                <>
                                    Join Now
                                    <ArrowRight size={16} />
                                </>
                            )}
                        </button>
                    </div>
                </form>

                {status === 'success' && (
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-emerald-400 font-medium"
                    >
                        Success! Welcome to the hub.
                    </motion.p>
                )}

                <p className="text-background/40 text-xs">
                    By subscribing, you agree to our <a href="/terms" className="underline hover:text-background/60">Terms</a> and <a href="/privacy" className="underline hover:text-background/60">Privacy Policy</a>.
                </p>
            </div>
        </section>
    );
}
