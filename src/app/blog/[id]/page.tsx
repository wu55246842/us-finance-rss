import { getBlogPostById } from '@/lib/api/blog';
import { format } from 'date-fns';
import { ArrowLeft, Calendar, Clock, Share2, Youtube, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { ShareMenu } from '@/components/ShareMenu';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { BlogPostContent } from '@/components/BlogPostContent';

interface Props {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;
    const post = await getBlogPostById(id);

    if (!post) return { title: 'Post Not Found' };

    return {
        title: `${post.title} | Market Insights`,
        description: post.content.substring(0, 160),
        openGraph: {
            title: post.title,
            description: post.content.substring(0, 160),
            type: 'article',
        }
    };
}

export default async function BlogPostPage({ params }: Props) {
    const { id } = await params;
    const post = await getBlogPostById(id);

    if (!post) {
        notFound();
    }

    // Helper to extract YouTube video ID
    const getYoutubeId = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const youtubeId = post.youtubeLink ? getYoutubeId(post.youtubeLink) : null;

    // Beautify content if not already an AI analysis post
    const beautifiedContent = post.content;

    const articleJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'NewsArticle',
        headline: post.title,
        datePublished: new Date(post.time).toISOString(),
        dateModified: new Date(post.time).toISOString(),
        author: {
            '@type': 'Organization',
            name: 'Financea',
            url: 'https://financea.me',
        },
        publisher: {
            '@type': 'Organization',
            name: 'Financea',
            logo: {
                '@type': 'ImageObject',
                url: 'https://financea.me/logo.svg',
            },
        },
        description: post.content.substring(0, 160),
    };

    return (
        <div className="min-h-screen bg-background pb-20">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
            />
            {/* Header / Navigation */}
            <div className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-md">
                <div className="container mx-auto flex h-16 max-w-4xl items-center px-4 justify-between">
                    <Link
                        href="/blog"
                        className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Insights
                    </Link>
                    <div className="hidden sm:block">
                        <Breadcrumbs />
                    </div>
                </div>
            </div>

            <article className="container mx-auto max-w-4xl px-4 py-12">
                {/* Post Header */}
                <header className="mb-12 space-y-6">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                            <Calendar className="h-4 w-4" />
                            {format(new Date(post.time), 'MMMM d, yyyy')}
                        </div>
                        <div className="h-1 w-1 rounded-full bg-border" />
                        <div className="flex items-center gap-1.5">
                            <Clock className="h-4 w-4" />
                            {Math.ceil(post.content.split(' ').length / 200)} min read
                        </div>
                    </div>

                    <h1 className="text-4xl font-black tracking-tight sm:text-5xl md:text-6xl text-balance">
                        {post.title}
                    </h1>

                    {/* Premium Share Menu */}
                    <div className="flex items-center gap-3 pt-4">
                        <ShareMenu title={post.title} />
                    </div>
                </header>

                {/* Main Content */}
                <div className="relative">
                    {/* YouTube Embed if available */}
                    {youtubeId && (
                        <div className="mb-12 overflow-hidden rounded-2xl border border-border bg-muted shadow-2xl">
                            <div className="aspect-video w-full">
                                <iframe
                                    src={`https://www.youtube.com/embed/${youtubeId}`}
                                    title={post.title}
                                    className="h-full w-full border-0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                            </div>
                        </div>
                    )}



                    {/* Text Content */}
                    <BlogPostContent
                        content={beautifiedContent}
                        chineseContent={post.chineseContent}
                    />

                    {/* Resources Section if available */}
                    {post.resources && post.resources.length > 0 && (
                        <div className="mt-16 rounded-2xl border border-border bg-muted/30 p-8">
                            <h3 className="mb-4 text-xl font-bold">Related Resources</h3>
                            <ul className="grid gap-3 sm:grid-cols-2">
                                {post.resources.map((resource, idx) => (
                                    <li key={idx}>
                                        <a
                                            href={resource}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group flex items-center justify-between rounded-xl border border-border bg-card p-4 hover:border-primary/50 hover:shadow-sm transition-all"
                                        >
                                            <span className="truncate text-sm font-medium">
                                                {resource.replace(/^https?:\/\//, '').split('/')[0]}
                                            </span>
                                            <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                {/* Footer / Call to Action */}
                <footer className="mt-20 border-t pt-12 text-center">
                    <p className="mb-6 text-muted-foreground">
                        Enjoyed this analysis? Check out our latest market updates.
                    </p>
                    <Link
                        href="/blog"
                        className="inline-flex items-center justify-center rounded-full bg-primary px-8 py-3 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all hover:scale-105"
                    >
                        Back to Feed
                    </Link>
                </footer>
            </article>
        </div>
    );
}
