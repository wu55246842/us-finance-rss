import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Contact Us',
    description: 'Get in touch with the US Markets & Macro Hub team.',
};

export default function ContactPage() {
    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl">
            <h1 className="text-4xl font-bold mb-8">Contact Us</h1>

            <section className="space-y-6 text-lg text-muted-foreground">
                <p>
                    We value your feedback and inquiries. Whether you have questions about our data sources, technical issues, or partnership opportunities, we're here to help.
                </p>

                <div className="bg-muted p-8 rounded-lg border border-border mt-8">
                    <h2 className="text-2xl font-semibold text-foreground mb-4">General Inquiries</h2>
                    <p className="mb-4">
                        For all general questions or feedback, please reach out to us via email:
                    </p>
                    <a href="mailto:wuliangtech0118@gmail.com" className="text-2xl font-medium text-primary hover:underline">
                        wuliangtech0118@gmail.com
                    </a>
                </div>

                <h2 className="text-2xl font-semibold text-foreground mt-12 mb-4">Data Corrections</h2>
                <p>
                    If you spot any inaccuracies in our aggregated data or have suggestions for new RSS sources to include, please email our data team with the subject line "Data Suggestion".
                </p>

                <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">Response Time</h2>
                <p>
                    We typically respond to all inquiries within 24-48 business hours.
                </p>
            </section>
        </div>
    );
}
