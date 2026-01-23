'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';

export function Breadcrumbs() {
    const pathname = usePathname();
    const paths = pathname.split('/').filter(Boolean);

    if (paths.length === 0) return null;

    return (
        <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6 overflow-x-auto whitespace-nowrap pb-2 scrollbar-none">
            <Link
                href="/"
                className="flex items-center hover:text-primary transition-colors"
                aria-label="Home"
            >
                <Home size={16} />
            </Link>

            {paths.map((path, index) => {
                const href = `/${paths.slice(0, index + 1).join('/')}`;
                const isLast = index === paths.length - 1;
                const label = path
                    .split('-')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ');

                return (
                    <div key={href} className="flex items-center space-x-2">
                        <ChevronRight size={14} className="flex-shrink-0 opacity-50" />
                        {isLast ? (
                            <span className="font-medium text-foreground truncate max-w-[200px]">
                                {label}
                            </span>
                        ) : (
                            <Link
                                href={href}
                                className="hover:text-primary transition-colors"
                            >
                                {label}
                            </Link>
                        )}
                    </div>
                );
            })}
        </nav>
    );
}
