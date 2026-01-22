import { generateText } from '../pollinations';
import { getAllFeeds } from '../rss';
import { db } from '../db';
import { blogPosts } from '../db/schema';
import { desc, eq } from 'drizzle-orm';

export async function generateDailyMarketAnalysis() {
    console.log('Starting daily market analysis generation...');

    try {
        // 1. Get latest RSS feeds for context
        const articles = await getAllFeeds();
        console.log(`Fetched ${articles.length} articles for context.`);
        const TopContext = articles.slice(0, 20).map(a => `- ${a.title}: ${a.summary?.substring(0, 100) || ''}...`).join('\n');

        // 2. Query Perplexity for real-time market research
        console.log('Step 1: Consulting Perplexity for market research...');
        const researchPrompt = `
Research the current market status and upcoming trends for the S&P 500 (SPX) and NASDAQ (IXIC). 
Focus on:
1. Significant technical levels and price action today.
2. Key macroeconomic drivers (Fed, inflation, earnings).
3. Integration of these recent headlines from our RSS aggregator:
${TopContext}

Provide a detailed summary of the bullish and bearish factors for both indices.
        `.trim();

        console.log('Research Prompt prepared. Length:', researchPrompt.length);

        const researchFindings = await generateText({
            messages: [{ role: 'user', content: researchPrompt }],
            model: 'perplexity-fast',
        });

        console.log('Research Findings received. Length:', researchFindings.length);

        // 3. Use Gemini to write a professional, high-value blog post
        console.log('Step 2: Generating professional blog post with Gemini...');
        const blogPrompt = `
You are a top-tier institutional financial strategist at a global investment bank. 
Based on these research findings, write a professional, "eye-catching" financial intelligence blog post.

RESEARCH DATA:
${researchFindings}

GUIDELINES:
1. **Title**: Institutional-grade, compelling H1 (e.g., "Market Pulse: SPX technicals suggest...").
2. **Executive Summary**: 3 bullet points of critical "must-know" info.
3. **Core Analysis**: Detailed sections on SPX and Nasdaq.
4. **Market Context**: Explain the "Why" behind the movements.
5. **Tone**: Sophisticated, authoritative, objective.
6. **Formatting**: Use clean Markdown. Avoid sensationalism but keep it engaging.
7. **Language**: English.

Write the full blog post now.
        `.trim();

        const finalBlogContent = await generateText({
            messages: [{ role: 'user', content: blogPrompt }],
            model: 'gemini-fast',
        });
        console.log('Final Blog Content generated. Length:', finalBlogContent.length);

        // 4. Extract Title (first line)
        const lines = finalBlogContent.split('\n');
        const title = lines[0].replace(/^#+\s*/, '').trim() || 'Daily Market Intelligence Report';

        // 5. Save to database
        console.log('Step 3: Saving to database. Title:', title);
        const [inserted] = await db.insert(blogPosts).values({
            title,
            content: finalBlogContent,
            type: 'ai_analysis',
        }).returning();

        console.log('Daily market analysis successfully generated and saved. DB ID:', inserted.id);
        return inserted;

    } catch (error) {
        console.error('Error in generateDailyMarketAnalysis:', error);
        throw error;
    }
}

export async function getLatestAIAnalysis() {
    try {
        const [latest] = await db
            .select()
            .from(blogPosts)
            .where(eq(blogPosts.type, 'ai_analysis'))
            .orderBy(desc(blogPosts.createdAt))
            .limit(1);
        return latest || null;
    } catch (error) {
        console.error('Error fetching latest AI analysis:', error);
        return null;
    }
}

export async function getAIAnalysisHistory() {
    try {
        return await db
            .select()
            .from(blogPosts)
            .where(eq(blogPosts.type, 'ai_analysis'))
            .orderBy(desc(blogPosts.createdAt));
    } catch (error) {
        console.error('Error fetching AI analysis history:', error);
        return [];
    }
}
