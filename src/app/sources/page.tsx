import { RSS_SOURCES } from '@/lib/sources';
import { ExternalLink, Rss } from 'lucide-react';

export const metadata = {
    title: 'Data Sources - US Markets & Macro Hub',
    description: 'List of financial news sources aggregated on this platform.',
};

export default function SourcesPage() {
    return (
        <div className="space-y-8 px-4 md:px-6 max-w-7xl mx-auto">
            <div className="space-y-4 py-8 text-center md:text-left">
                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-300">
                    Data Sources
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl">
                    Transparency is key. Here are the trusted financial news outlets and official government feeds we aggregate.
                </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {RSS_SOURCES.map((source) => (
                    <div
                        key={source.id}
                        className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-lg hover:border-primary/20 hover:-translate-y-1"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary/5 opacity-0 transition-opacity group-hover:opacity-100" />

                        <div className="relative z-10 space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                    <Rss className="h-5 w-5" />
                                </div>
                                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    {source.category}
                                </span>
                            </div>

                            <div>
                                <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors">
                                    {source.name}
                                </h3>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    {source.description}
                                </p>
                            </div>
                        </div>

                        <div className="relative z-10 mt-6 pt-4 border-t border-border/50">
                            <a
                                href={source.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center text-sm font-medium text-primary hover:underline"
                            >
                                View RSS Feed <ExternalLink className="ml-1 h-3 w-3" />
                            </a>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
