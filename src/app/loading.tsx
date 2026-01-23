'use client';

import { motion } from 'framer-motion';

export default function Loading() {
    return (
        <div className="space-y-8 pb-12">
            {/* Hero Skeleton */}
            <section className="relative h-[50vh] min-h-[400px] flex items-center justify-center overflow-hidden bg-muted/20">
                <div className="container px-4 md:px-6 relative z-10 text-center space-y-6">
                    <div className="mx-auto h-12 w-3/4 max-w-2xl rounded-full bg-muted animate-pulse" />
                    <div className="mx-auto h-6 w-1/2 max-w-lg rounded-full bg-muted animate-pulse" />
                </div>
            </section>

            {/* Tickers Skeleton */}
            <div className="container mx-auto px-4 md:px-6 max-w-7xl">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-24 rounded-2xl bg-muted animate-pulse" />
                    ))}
                </div>
            </div>

            {/* Content Skeleton */}
            <div className="container mx-auto px-4 md:px-6 max-w-7xl space-y-8">
                {/* Market Report Header Skeleton */}
                <div className="h-64 rounded-[2rem] bg-muted animate-pulse" />

                {/* Feed Skeleton */}
                <div className="space-y-6">
                    <div className="flex gap-4 border-b border-border pb-2">
                        <div className="h-8 w-24 rounded bg-muted animate-pulse" />
                        <div className="h-8 w-24 rounded bg-muted animate-pulse" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="space-y-4">
                                <div className="aspect-video rounded-xl bg-muted animate-pulse" />
                                <div className="h-4 w-3/4 rounded bg-muted animate-pulse" />
                                <div className="h-4 w-1/2 rounded bg-muted animate-pulse" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
