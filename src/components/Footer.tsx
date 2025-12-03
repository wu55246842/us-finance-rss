export function Footer() {
    return (
        <footer className="border-t border-border bg-muted/30 py-6 md:py-10">
            <div className="container mx-auto px-4 md:px-6 max-w-7xl flex flex-col items-center justify-between gap-4 md:flex-row">
                <p className="text-center text-sm text-muted-foreground md:text-left">
                    &copy; {new Date().getFullYear()} US Markets & Macro Hub. Data provided by public RSS feeds for educational purposes.
                </p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Not financial advice.</span>
                </div>
            </div>
        </footer>
    );
}
