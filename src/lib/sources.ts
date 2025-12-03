import { Source } from './types';

export const RSS_SOURCES: Source[] = [
    // Yahoo Finance
    {
        id: 'yahoo-gspc',
        name: 'Yahoo Finance (S&P 500)',
        url: 'https://feeds.finance.yahoo.com/rss/2.0/headline?s=^GSPC&region=US&lang=en-US',
        category: 'markets',
        description: 'S&P 500 market news from Yahoo Finance.',
    },
    {
        id: 'yahoo-aapl',
        name: 'Yahoo Finance (AAPL)',
        url: 'https://feeds.finance.yahoo.com/rss/2.0/headline?s=AAPL&region=US&lang=en-US',
        category: 'markets',
        description: 'Apple Inc. stock news from Yahoo Finance.',
    },
    // CNBC
    {
        id: 'cnbc-markets',
        name: 'CNBC Markets',
        url: 'https://www.cnbc.com/id/10001147/device/rss/rss.html',
        category: 'markets',
        description: 'Latest market news from CNBC.',
    },
    {
        id: 'cnbc-top',
        name: 'CNBC Top Stories',
        url: 'https://www.cnbc.com/id/100003114/device/rss/rss.html',
        category: 'markets',
        description: 'Top financial stories from CNBC.',
    },
    {
        id: 'cnbc-economy',
        name: 'CNBC Economy',
        url: 'https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=20910258',
        category: 'macro',
        description: 'Economy news from CNBC.',
    },
    // Investing.com
    {
        id: 'investing-news',
        name: 'Investing.com News',
        url: 'https://www.investing.com/rss/news.rss',
        category: 'markets',
        description: 'General financial news from Investing.com.',
    },
    // Official Sources
    {
        id: 'bea',
        name: 'Bureau of Economic Analysis (BEA)',
        url: 'https://apps.bea.gov/rss/rss.xml',
        category: 'official',
        description: 'Official economic data from the US BEA.',
    },
    {
        id: 'bls',
        name: 'Bureau of Labor Statistics (BLS)',
        url: 'https://www.bls.gov/feed/bls_latest.rss',
        category: 'official',
        description: 'Labor statistics and economic data from the US BLS.',
    },
    {
        id: 'fed',
        name: 'Federal Reserve',
        url: 'https://www.federalreserve.gov/feeds/press_all.xml',
        category: 'official',
        description: 'Press releases from the Federal Reserve.',
    },
];
