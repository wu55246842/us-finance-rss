'use server';

import { runAgentAnalysis, AgentRole } from '@/lib/agents/core';
import { getCompanyProfile, getMarketNews, getPriceHistory, getTechnicalIndicators } from '@/lib/api/market';

export type AnalysisResult = {
    role: AgentRole;
    content: string;
    reasoning_content?: string;
    status: 'working' | 'done' | 'error';
};

export type WorkflowState = {
    metadata?: {
        ticker: string;
        timestamp: string; // ISO string
        model: string;
    };
    technical?: AnalysisResult;
    fundamental?: AnalysisResult;
    sentiment?: AnalysisResult;
    researcher?: AnalysisResult;
    reporter?: AnalysisResult;
    error?: string;
};

export async function startTradingAnalysis(ticker: string, language: string = 'English'): Promise<WorkflowState> {
    try {
        const startTime = new Date();

        // 1. Fetch Data
        console.log(`Fetching data for ${ticker}...`);
        const profile = await getCompanyProfile(ticker);
        const news = await getMarketNews(ticker);
        const history = await getPriceHistory(ticker, 200);
        const indicators = await getTechnicalIndicators(ticker);

        console.debug(`-----------------------------------------------------------------------------------------`);
        console.debug(profile)
        console.debug(`-----------------------------------------------------------------------------------------`);
        console.debug(news)
        console.debug(`-----------------------------------------------------------------------------------------`);
        console.debug(indicators)
        // Stringify data for prompts
        const langInstruction = `IMPORTANT: Output your entire response strictly in ${language} language.`;

        const technicalData = `
        ${langInstruction}
        Ticker: ${ticker}
        Recent Price History (Last 5 days): ${JSON.stringify(history.slice(-5))}
        Technical Indicators: ${JSON.stringify(indicators)}
        Last Price: ${history[history.length - 1]?.close}
        `;

        const fundamentalData = `
        ${langInstruction}
        Ticker: ${ticker}
        Financial Summary: ${JSON.stringify(profile)}
        `;

        const sentimentData = `
        ${langInstruction}
        Ticker: ${ticker}
        Recent News: ${JSON.stringify(news)}
        `;

        // 2. Run Analysts in Parallel (Staggered by 5s to avoid rate limits)
        console.log(`Running analysts for ${ticker}...`);

        const technicalPromise = runAgentAnalysis('technical', technicalData);
        await new Promise(resolve => setTimeout(resolve, 5000));

        const fundamentalPromise = runAgentAnalysis('fundamental', fundamentalData);
        await new Promise(resolve => setTimeout(resolve, 10000));

        const sentimentPromise = runAgentAnalysis('sentiment', sentimentData);

        const [technical, fundamental, sentiment] = await Promise.all([
            technicalPromise,
            fundamentalPromise,
            sentimentPromise
        ]);

        console.debug("Technical Report:", technical.content.substring(0, 200) + "...");
        console.debug("Fundamental Report:", fundamental.content.substring(0, 200) + "...");
        console.debug("Sentiment Report:", sentiment.content.substring(0, 200) + "...");

        // 3. Run Researcher (Debate)
        console.log(`Running researcher for ${ticker}...`);
        const debateContext = `
        ${langInstruction}
        Synthesize the following reports:
        
        [TECHNICAL REPORT]
        ${technical.content}

        [FUNDAMENTAL REPORT]
        ${fundamental.content}

        [SENTIMENT REPORT]
        ${sentiment.content}
        `;
        const researcher = await runAgentAnalysis('researcher', debateContext);
        console.log("Researcher Synthesis:", researcher.content.substring(0, 200) + "...");

        // 4. Run Reporter
        console.log(`Running reporter for ${ticker}...`);
        const reporterData = `
        ${langInstruction}
        Create an investment decision memo based on this research synthesis:
        ${researcher.content}
        `;
        const reporter = await runAgentAnalysis('reporter', reporterData);
        console.log("Final Report:", reporter.content.substring(0, 200) + "...");

        return {
            metadata: {
                ticker: ticker.toUpperCase(),
                timestamp: startTime.toISOString(),
                model: 'GPT-4o (via Pollinations)',
            },
            technical: { role: 'technical', content: technical.content, status: 'done' },
            fundamental: { role: 'fundamental', content: fundamental.content, status: 'done' },
            sentiment: { role: 'sentiment', content: sentiment.content, status: 'done' },
            researcher: { role: 'researcher', content: researcher.content, status: 'done' },
            reporter: { role: 'reporter', content: reporter.content, status: 'done' },
            // priceHistory: history, // Frontend fetches this independently now
        };

    } catch (e: any) {
        console.error("Agent Workflow Error:", e);
        return { error: e.message || "Failed to run analysis workflow" };
    }
}
