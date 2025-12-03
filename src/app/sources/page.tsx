import { RSS_SOURCES } from '@/lib/sources';
import { ExternalLink, Rss } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
    title: 'Data Sources - US Markets & Macro Hub',
    description: 'List of RSS feeds used in this aggregator.',
};

export default function SourcesPage() {
    return (
        <div className="space-y-8">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Data Sources</h1>
                <p className="text-muted-foreground">
                    The following RSS feeds are used to aggregate news for this website.
                </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {RSS_SOURCES.map((source) => (
                    <div key={source.id} className="rounded-lg border border-border bg-card p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <Rss className="h-5 w-5 text-primary" />
                                <span className="font-semibold">{source.name}</span>
                            </div>
                            <span className="text-xs font-medium px-2 py-1 rounded-full bg-secondary text-secondary-foreground">
                                {source.category}
                            </span>
                        </div>

                        <p className="text-sm text-muted-foreground mb-4 min-h-[40px]">
                            {source.description}
                        </p>

                        <Link
                            href={source.url}
                            target="_blank"
                            className="text-sm font-medium text-primary hover:underline flex items-center gap-1"
                        >
                            View RSS Feed <ExternalLink className="h-3 w-3" />
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
}
