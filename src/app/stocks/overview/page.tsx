// Adapted from Open-Dev-Society/OpenStock, licensed under AGPL-3.0

import TradingViewWidget from "@/components/openstock/TradingViewWidget";
import {
    HEATMAP_WIDGET_CONFIG,
    MARKET_DATA_WIDGET_CONFIG,
    MARKET_OVERVIEW_WIDGET_CONFIG,
    TOP_STORIES_WIDGET_CONFIG
} from "@/lib/openstock/constants";

export const metadata = {
    title: 'Market Overview - US Markets & Macro Hub',
    description: 'Real-time market overview, heatmaps, and top stories.',
};

export default function MarketOverview() {
    const scriptUrl = `https://s3.tradingview.com/external-embedding/embed-widget-`;

    return (
        <div className="flex min-h-screen p-4 md:p-6 lg:p-8">
            <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto">
                <div className="space-y-4 text-center md:text-left">
                    <h1 className="text-3xl font-bold tracking-tight sm:text-4xl bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-400 dark:to-cyan-300 pb-1">
                        Market Overview
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl">
                        Global market data, heatmaps, and top financial stories.
                    </p>
                </div>

                <section className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    <div className="xl:col-span-1">
                        <TradingViewWidget
                            title="Market Overview"
                            scriptUrl={`${scriptUrl}market-overview.js`}
                            config={MARKET_OVERVIEW_WIDGET_CONFIG}
                            className="custom-chart"
                            height={600}
                        />
                    </div>
                    <div className="xl:col-span-2">
                        <TradingViewWidget
                            title="Stock Heatmap"
                            scriptUrl={`${scriptUrl}stock-heatmap.js`}
                            config={HEATMAP_WIDGET_CONFIG}
                            height={600}
                        />
                    </div>
                </section>

                <section className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    <div className="xl:col-span-2">
                        <TradingViewWidget
                            scriptUrl={`${scriptUrl}market-quotes.js`}
                            config={MARKET_DATA_WIDGET_CONFIG}
                            height={600}
                        />
                    </div>
                    <div className="xl:col-span-1">
                        <TradingViewWidget
                            scriptUrl={`${scriptUrl}timeline.js`}
                            config={TOP_STORIES_WIDGET_CONFIG}
                            height={600}
                        />
                    </div>
                </section>
            </div>
        </div>
    )
}
