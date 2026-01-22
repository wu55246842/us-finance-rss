import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'About Us',
    description: 'Learn about US Markets & Macro Hub and our mission to provide transparent financial intelligence.',
};

export default function AboutPage() {
    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl">
            <h1 className="text-4xl font-bold mb-8">About US Markets & Macro Hub</h1>

            <section className="space-y-6 text-lg text-muted-foreground">
                <p>
                    Welcome to <strong>US Markets & Macro Hub</strong>, your premier destination for real-time aggregation of US financial markets and macroeconomic data.
                </p>

                <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">Our Mission</h2>
                <p>
                    In an era of information overload, our mission is to provide a clean, centralized, and noise-free bridge to the most critical financial information. We aggregate data from official government sources (Fed, Treasury, BLS), major financial institutions, and trusted news outlets to give you a comprehensive view of the American economic landscape.
                </p>

                <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">Expertise & Transparency</h2>
                <p>
                    Our platform is designed for quantitative analysts, retail investors, and macro enthusiasts who value data integrity. We prioritize raw data and official reports, removing the sensationalism often found in modern financial media.
                </p>

                <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">Who This Is For</h2>
                <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Traders:</strong> Stay ahead of market-moving news with our consolidated feed.</li>
                    <li><strong>Economists:</strong> Track macro trends through official data releases.</li>
                    <li><strong>Researchers:</strong> Use our structured archive for intelligence gathering.</li>
                </ul>
            </section>
        </div>
    );
}
