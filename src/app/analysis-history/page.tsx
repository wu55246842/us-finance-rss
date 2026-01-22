import { getAIAnalysisHistory } from '@/lib/api/ai-analysis';
import { format } from 'date-fns';
import Link from 'next/link';
import { Sparkles, ArrowRight, TrendingUp } from 'lucide-react';

export const revalidate = 3600;

export default async function AnalysisHistoryPage() {
    const history = await getAIAnalysisHistory();

    return (
        <div className="container mx-auto px-4 py-12 max-w-5xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div>
                    <h1 className="text-4xl font-black tracking-tight mb-2">Market Intelligence History</h1>
                    <p className="text-muted-foreground text-lg">Archive of expert AI insights on US Markets & Macro.</p>
                </div>
                <div className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary/10 text-primary border border-primary/20 font-bold uppercase tracking-widest text-sm">
                    <Sparkles size={20} />
                    AI AGENT
                </div>
            </div>

            {history.length === 0 ? (
                <div className="text-center py-20 border-2 border-dashed border-border rounded-3xl">
                    <TrendingUp size={48} className="mx-auto mb-4 text-muted-foreground opacity-20" />
                    <p className="text-xl font-medium text-muted-foreground">No analysis history found yet.</p>
                </div>
            ) : (
                <div className="grid gap-8">
                    {history.map((item) => (
                        <Link
                            key={item.id}
                            href={`/blog/ai-${item.id}`}
                            className="group relative overflow-hidden rounded-3xl border border-border bg-card p-6 md:p-8 transition-all hover:shadow-xl hover:-translate-y-1 active:scale-[0.98]"
                        >
                            <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-10 transition-opacity">
                                <TrendingUp size={120} />
                            </div>

                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="space-y-4 max-w-3xl">
                                    <div className="text-sm font-bold text-primary flex items-center gap-2">
                                        {format(new Date(item.createdAt), 'MMMM dd, yyyy • HH:mm')} SGT
                                    </div>
                                    <h2 className="text-2xl font-bold leading-tight group-hover:text-primary transition-colors">
                                        {item.title}
                                    </h2>
                                    <p className="text-muted-foreground line-clamp-2 text-sm leading-relaxed">
                                        {item.content.substring(0, 200)}...
                                    </p>
                                </div>
                                <div className="flex-shrink-0">
                                    <div className="flex items-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm font-bold group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                                        Read Analysis
                                        <ArrowRight size={16} />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
