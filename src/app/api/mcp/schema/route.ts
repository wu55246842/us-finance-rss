import { NextResponse } from 'next/server';

export async function GET() {
    const tools = [
        {
            type: "function",
            function: {
                name: "analyze_stock",
                description: "Run a multi-agent AI analysis on a stock ticker (Technical, Fundamental, Sentiment).",
                parameters: {
                    type: "object",
                    properties: {
                        ticker: {
                            type: "string",
                            description: "The stock ticker symbol, e.g. NVDA, AAPL"
                        },
                        language: {
                            type: "string",
                            description: "The language for the report (default: English)"
                        }
                    },
                    required: ["ticker"]
                }
            }
        },
        {
            type: "function",
            function: {
                name: "get_price_history",
                description: "Get historical price data (Open, High, Low, Close, Volume) for a stock.",
                parameters: {
                    type: "object",
                    properties: {
                        ticker: {
                            type: "string",
                            description: "The stock ticker symbol"
                        },
                        days: {
                            type: "number",
                            description: "Number of days to fetch (default: 100)"
                        }
                    },
                    required: ["ticker"]
                }
            }
        },
        {
            type: "function",
            function: {
                name: "get_market_news",
                description: "Get recent market news headlines for a specific stock.",
                parameters: {
                    type: "object",
                    properties: {
                        ticker: {
                            type: "string",
                            description: "The stock ticker symbol"
                        }
                    },
                    required: ["ticker"]
                }
            }
        },
        {
            type: "function",
            function: {
                name: "read_discussion",
                description: "Reads the latest AI roundtable discussion to understand market sentiment.",
                parameters: {
                    type: "object",
                    properties: {},
                    required: []
                }
            }
        }
    ];

    return NextResponse.json(tools);
}
