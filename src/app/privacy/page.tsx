import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Privacy Policy',
    description: 'Our commitment to protecting your privacy and handling your data with transparency.',
};

export default function PrivacyPage() {
    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl">
            <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>

            <section className="space-y-6 text-muted-foreground">
                <p>Last updated: January 22, 2026</p>

                <p>
                    At US Markets & Macro Hub, reachable from financea.me, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by US Markets & Macro Hub and how we use it.
                </p>

                <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">Log Files</h2>
                <p>
                    US Markets & Macro Hub follows a standard procedure of using log files. These files log visitors when they visit websites. The information collected by log files include internet protocol (IP) addresses, browser type, Internet Service Provider (ISP), date and time stamp, referring/exit pages, and possibly the number of clicks. These are not linked to any information that is personally identifiable.
                </p>

                <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">Cookies and Web Beacons</h2>
                <p>
                    Like any other website, US Markets & Macro Hub uses 'cookies'. These cookies are used to store information including visitors' preferences, and the pages on the website that the visitor accessed or visited. The information is used to optimize the users' experience by customizing our web page content based on visitors' browser type and/or other information.
                </p>

                <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">Google DoubleClick DART Cookie</h2>
                <p>
                    Google is one of a third-party vendor on our site. It also uses cookies, known as DART cookies, to serve ads to our site visitors based upon their visit to our site and other sites on the internet.
                </p>

                <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">Advertising Partners</h2>
                <p>
                    Third-party ad servers or ad networks uses technologies like cookies, JavaScript, or Web Beacons that are used in their respective advertisements and links that appear on US Markets & Macro Hub, which are sent directly to users' browser. They automatically receive your IP address when this occurs. These technologies are used to measure the effectiveness of their advertising campaigns and/or to personalize the advertising content that you see on websites that you visit.
                </p>
            </section>
        </div>
    );
}
