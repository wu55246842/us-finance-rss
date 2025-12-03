interface AdPlaceholderProps {
    size?: 'banner' | 'rectangle';
    className?: string;
}

export function AdPlaceholder({ size = 'banner', className = '' }: AdPlaceholderProps) {
    const dimensions = size === 'banner' ? '728x90' : '300x250';

    return (
        <div className={`flex items-center justify-center bg-muted/50 border-2 border-dashed border-muted rounded-lg p-4 text-muted-foreground text-sm font-medium ${className}`}
            style={{ minHeight: size === 'banner' ? '90px' : '250px' }}
        >
            AdSense Placeholder {dimensions}
        </div>
    );
}
