import Link from 'next/link';

export function Footer() {
    return (
        <footer className="border-t border-border bg-muted/30 py-8 md:py-12">
            <div className="container mx-auto px-4 md:px-6 max-w-7xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center justify-between">
                    <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            &copy; {new Date().getFullYear()} US Markets & Macro Hub. Data provided by public RSS feeds for educational purposes.
                            <span className="block mt-1 font-medium italic">Not financial advice.</span>
                        </p>
                    </div>
                    <div className="flex flex-wrap justify-center md:justify-end gap-x-6 gap-y-2 text-sm font-medium text-muted-foreground">
                        <Link href="/about" className="hover:text-primary transition-colors">About Us</Link>
                        <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
                        <Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
                        <Link href="/contact" className="hover:text-primary transition-colors">Contact Us</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
