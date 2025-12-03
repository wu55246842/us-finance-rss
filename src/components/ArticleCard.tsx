import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { ExternalLink } from 'lucide-react';
import { Article } from '@/lib/types';

interface ArticleCardProps {
    article: Article;
}

export function ArticleCard({ article }: ArticleCardProps) {
    return (
        <div className="group relative flex flex-col justify-between rounded-lg border border-border bg-card p-5 shadow-sm transition-all hover:shadow-md hover:scale-[1.01]">
            <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="font-medium text-primary">{article.sourceName}</span>
                    <span>{formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })}</span>
                </div>

                <h3 className="text-lg font-semibold leading-tight tracking-tight text-card-foreground group-hover:text-primary transition-colors">
                    <Link href={article.link} target="_blank" rel="noopener noreferrer" className="flex items-start gap-2">
                        {article.title}
                        <ExternalLink className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100 mt-1 shrink-0" />
                    </Link>
                </h3>

                <p className="text-sm text-muted-foreground line-clamp-3">
                    {article.summary || article.title}
                </p>
            </div>

            <div className="mt-4 flex items-center gap-2">
                <span className="inline-flex items-center rounded-full border border-transparent bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground transition-colors hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                    {article.category}
                </span>
            </div>
        </div>
    );
}
