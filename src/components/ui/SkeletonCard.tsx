import { clsx } from 'clsx';

export function SkeletonCard() {
    return (
        <div className="flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm animate-pulse h-[280px]">
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="h-5 w-24 bg-muted rounded-full" />
                </div>

                <div className="space-y-2">
                    <div className="h-6 w-3/4 bg-muted rounded-md" />
                    <div className="h-6 w-1/2 bg-muted rounded-md" />
                </div>

                <div className="space-y-2 pt-2">
                    <div className="h-4 w-full bg-muted rounded-md" />
                    <div className="h-4 w-5/6 bg-muted rounded-md" />
                </div>
            </div>

            <div className="mt-6 flex items-center gap-2">
                <div className="h-4 w-32 bg-muted rounded-md" />
            </div>
        </div>
    );
}

export function LoadingGrid() {
    return (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 9 }).map((_, i) => (
                <SkeletonCard key={`skeleton-${i}`} />
            ))}
        </div>
    );
}
