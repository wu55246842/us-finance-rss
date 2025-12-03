import { FileX2 } from 'lucide-react';

interface EmptyStateProps {
    message?: string;
}

export function EmptyState({ message = "No articles found." }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
            <div className="p-4 rounded-full bg-muted/50">
                <FileX2 className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">No Content Available</h3>
            <p className="text-muted-foreground max-w-sm">
                {message}
            </p>
        </div>
    );
}
