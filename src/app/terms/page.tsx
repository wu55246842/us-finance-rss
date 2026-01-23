import { Metadata } from 'next';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';

export const metadata: Metadata = {
    title: 'Terms of Service',
    description: 'Legal terms and conditions for using the US Markets & Macro Hub platform.',
};

export default function TermsPage() {
    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl">
            <Breadcrumbs />
            <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>

            <section className="space-y-6 text-muted-foreground">
                <p>Last updated: January 22, 2026</p>

                <p>
                    By accessing the website at <a href="https://financea.me" className="text-primary hover:underline">financea.me</a>, you are agreeing to be bound by these terms of service, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws.
                </p>

                <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">1. Use License</h2>
                <p>
                    Permission is granted to temporarily download one copy of the materials (information or software) on US Markets & Macro Hub's website for personal, non-commercial transitory viewing only.
                </p>

                <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">2. Disclaimer</h2>
                <p>
                    The materials on US Markets & Macro Hub's website are provided on an 'as is' basis. US Markets & Macro Hub makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
                </p>
                <p>
                    Further, US Markets & Macro Hub does not warrant or make any representations concerning the accuracy, likely results, or reliability of the use of the materials on its website or otherwise relating to such materials or on any sites linked to this site.
                </p>

                <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">3. Not Financial Advice</h2>
                <p className="bg-muted p-4 border-l-4 border-primary italic">
                    The content provided on this website is for informational and educational purposes only and does not constitute financial, investment, legal, or tax advice. Always seek the advice of a qualified professional before making any financial decisions.
                </p>
            </section>
        </div>
    );
}
