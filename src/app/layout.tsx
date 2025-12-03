import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'US Markets & Macro Hub – American Stock Market & Macroeconomic News Aggregator',
  description: 'Aggregating US stock market news, individual stock updates (AAPL, etc.), macro economic data, Fed news, and official government reports.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen flex flex-col bg-background text-foreground antialiased`}>
        <Header />
        <main className="flex-1 container mx-auto px-4 md:px-6 py-6 max-w-7xl">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
