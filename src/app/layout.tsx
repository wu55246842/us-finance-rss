import type { Metadata } from 'next';
// Force Vercel rebuild: 2025-12-03
import { Analytics } from "@vercel/analytics/react";
import { Inter } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { BackToTop } from '@/components/ui/BackToTop';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://financea.me'),
  title: {
    default: 'US Markets & Macro Hub – American Stock Market & Macroeconomic News Aggregator',
    template: '%s | US Markets & Macro Hub'
  },
  description: 'Aggregating US stock market news, individual stock updates (AAPL, etc.), macro economic data, Fed news, and official government reports.',
  keywords: ['US markets', 'stock market news', 'macroeconomic data', 'Fed news', 'financial news aggregator', 'American stocks', 'financea'],
  authors: [{ name: 'Financea Team' }],
  creator: 'Financea',
  publisher: 'Financea',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'US Markets & Macro Hub',
    description: 'American Stock Market & Macroeconomic News Aggregator',
    url: 'https://financea.me',
    siteName: 'US Markets & Macro Hub',
    images: [
      {
        url: '/og-image.png', // Fallback to a default OG image
        width: 1200,
        height: 630,
        alt: 'US Markets & Macro Hub',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'US Markets & Macro Hub',
    description: 'American Stock Market & Macroeconomic News Aggregator',
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: '/',
  },
  verification: {
    google: 'n-wQ4GYKs9oW6Y0ZMqzNlfvK0RH93f-HkA63k2l96KU',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'US Markets & Macro Hub',
    url: 'https://financea.me',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://financea.me/search?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  };

  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Financea',
    url: 'https://financea.me',
    logo: 'https://financea.me/logo.svg',
    sameAs: [
      'https://twitter.com/financea', // Placeholders for future social links
      'https://github.com/financea',
    ],
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
      </head>
      <body className={`${inter.className} min-h-screen flex flex-col bg-background text-foreground antialiased selection:bg-primary/20`}>
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9915837040894736"
          crossOrigin="anonymous"
          strategy="beforeInteractive"
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
          <BackToTop />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
