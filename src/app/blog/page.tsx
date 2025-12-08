import { fetchBlogPosts } from '@/lib/api/blog';
import { BlogCard } from '@/components/BlogCard';

export const dynamic = 'force-dynamic';

export default async function BlogPage() {
    const posts = await fetchBlogPosts();

    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section */}
            <section className="border-b bg-muted/40 py-12 md:py-24">
                <div className="container mx-auto px-4 md:px-6 max-w-7xl">
                    <div className="flex flex-col gap-4">
                        <h1 className="text-4xl md:text-6xl font-black tracking-tighter">
                            Market <span className="text-primary">Insights</span>
                        </h1>
                        <p className="text-xl text-muted-foreground max-w-[600px]">
                            Deep dives, technical analysis, and macro commentary on the latest market trends.
                        </p>
                    </div>
                </div>
            </section>

            {/* Content Section */}
            <section className="py-12 md:py-16">
                <div className="container mx-auto px-4 md:px-6 max-w-7xl">
                    {posts.length > 0 ? (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {posts.map((post) => (
                                <BlogCard key={post.id} post={post} />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <p className="text-lg text-muted-foreground">No posts found at the moment.</p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
