import { BlogPost } from '@/lib/types/blog';
import { format } from 'date-fns';
import { ExternalLink, Youtube, Link as LinkIcon } from 'lucide-react';

interface BlogCardProps {
    post: BlogPost;
}

export function BlogCard({ post }: BlogCardProps) {
    // Helper to extract YouTube video ID if possible, for thumbnail
    const getYoutubeId = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const youtubeId = post.youtubeLink ? getYoutubeId(post.youtubeLink) : null;

    return (
        <article className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all hover:shadow-md hover:border-primary/50">
            {youtubeId && (
                <div className="relative aspect-video w-full overflow-hidden bg-muted">
                    <img
                        src={`https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`}
                        alt={post.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Youtube className="h-12 w-12 text-white drop-shadow-lg" />
                    </div>
                </div>
            )}

            <div className="flex flex-col p-6 gap-4 h-full">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <time dateTime={post.time}>
                        {format(new Date(post.time), 'MMM d, yyyy • h:mm a')}
                    </time>
                </div>

                <div className="space-y-2">
                    <h2 className="text-2xl font-bold tracking-tight group-hover:text-primary transition-colors">
                        {post.title}
                    </h2>
                    <p className="text-muted-foreground line-clamp-3 leading-relaxed">
                        {post.content}
                    </p>
                </div>

                <div className="mt-auto pt-4 flex flex-wrap gap-3 items-center">
                    {post.youtubeLink && (
                        <a
                            href={post.youtubeLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-sm font-medium text-red-600 hover:text-red-700 bg-red-50 dark:bg-red-950/30 px-3 py-1.5 rounded-full transition-colors"
                        >
                            <Youtube className="h-4 w-4" />
                            Watch Video
                        </a>
                    )}

                    {post.resources && post.resources.length > 0 && post.resources.map((resource, idx) => (
                        <a
                            key={idx}
                            href={resource}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary bg-secondary px-3 py-1.5 rounded-full transition-colors"
                        >
                            <LinkIcon className="h-3 w-3" />
                            Resource {idx + 1}
                        </a>
                    ))}
                </div>
            </div>
        </article>
    );
}
