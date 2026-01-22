import { BlogPost } from '@/lib/types/blog';
import { generateText } from '@/lib/pollinations';

export async function fetchBlogPosts(): Promise<BlogPost[]> {
    const SHEET_ID = process.env.NEXT_PUBLIC_GOOGLE_SHEET_ID || '11ItEdcG-6950z5K3V6Wa1JeEeLYLCTnw9wJAi6KYGYY';
    const GID = process.env.NEXT_PUBLIC_GOOGLE_SHEET_GID || '0';

    if (!SHEET_ID) {
        console.warn('NEXT_PUBLIC_GOOGLE_SHEET_ID is not set.');
        return [];
    }

    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${GID}`;

    try {
        const response = await fetch(url, { next: { revalidate: 3600 } });
        if (!response.ok) throw new Error('Failed to fetch Google Sheet data');

        const csvText = await response.text();

        // Robust CSV parser to handle multiline quoted content
        const rows: { datetime: string; content: string }[] = [];
        const regex = /^(\d{12}),"((?:[^"]|"")*)"/gm;
        let match;

        while ((match = regex.exec(csvText)) !== null) {
            const datetime = match[1];
            // Unescape double quotes
            const content = match[2].replace(/""/g, '"');
            rows.push({ datetime, content });
        }

        if (rows.length === 0 && csvText.trim().length > 0) {
            // Fallback for simple non-quoted format if regex fails
            csvText.split('\n').forEach(row => {
                const firstCommaIndex = row.indexOf(',');
                if (firstCommaIndex !== -1) {
                    const datetime = row.substring(0, firstCommaIndex).trim();
                    const content = row.substring(firstCommaIndex + 1).trim().replace(/^"|"$/g, '').replace(/""/g, '"');
                    if (datetime && datetime !== 'datetime' && /^\d+$/.test(datetime)) {
                        rows.push({ datetime, content });
                    }
                }
            });
        }

        return rows.map((row, index) => {
            // Parse datetime format: 202601112033 (YYYYMMDDHHmm)
            const dt = row.datetime;
            let isoDate = new Date().toISOString();

            if (dt.length === 12) {
                const year = dt.substring(0, 4);
                const month = dt.substring(4, 6);
                const day = dt.substring(6, 8);
                const hour = dt.substring(8, 10);
                const minute = dt.substring(10, 12);
                isoDate = new Date(`${year}-${month}-${day}T${hour}:${minute}:00Z`).toISOString();
            }

            // Extract title from content (first line or first 100 chars)
            const lines = row.content.split('\n');
            const title = lines[0].length > 100 ? lines[0].substring(0, 97) + '...' : lines[0];

            return {
                id: `sheet-${index}-${dt}`,
                time: isoDate,
                title: title || 'Market Intelligence Update',
                content: row.content,
            };
        }).sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()); // Newest first
    } catch (error) {
        console.error('Error fetching blog posts from Google Sheets:', error);
        return [];
    }
}

import { db } from '../db';
import { blogPosts } from '../db/schema';
import { eq } from 'drizzle-orm';

export async function getBlogPostById(id: string): Promise<BlogPost | null> {
    if (id.startsWith('ai-')) {
        try {
            const dbId = parseInt(id.replace('ai-', ''));
            const [post] = await db
                .select()
                .from(blogPosts)
                .where(eq(blogPosts.id, dbId))
                .limit(1);

            if (post) {
                return {
                    id: `ai-${post.id}`,
                    title: post.title,
                    content: post.content,
                    time: post.createdAt.toISOString(),
                    type: post.type as any,
                };
            }
        } catch (error) {
            console.error('Error fetching AI post by ID:', error);
        }
    }

    const posts = await fetchBlogPosts();
    return posts.find(p => p.id === id) || null;
}

export async function beautifyBlogContent(content: string): Promise<string> {
    try {
        const prompt = `
You are a senior financial analyst and content strategist. Your task is to transform the following raw financial data into a high-value, professional blog post that demonstrates "Expertise, Authoritativeness, and Trustworthiness" (E-A-T).

FOLLOW THESE RULES:
1.  **Structure**: Start with a compelling, descriptive H1 title.
2.  **Summary**: Include a brief "Key Takeaways" or "Executive Summary" section (2-3 bullet points) at the top.
3.  **Depth**: Add a "Market Context" or "Analysis" section that explains why this data matters for investors or the economy, based on the provided content.
4.  **Formatting**: Use clean Markdown with headers (##), bold text for emphasis, and organized lists.
5.  **Data Integrity**: Do not change the fundamental facts or numbers provided in the input, but you MAY rephrase sentences for better flow and professional tone.
6.  **Style**: Use a sophisticated, institutional-grade tone (similar to Bloomberg or The Wall Street Journal).

Raw Content:
${content}
        `.trim();

        const formatted = await generateText({
            messages: [{ role: 'user', content: prompt }],
            model: 'gemini-fast',
        });

        return formatted || content;
    } catch (error) {
        console.error('Error beautifying blog content:', error);
        return content;
    }
}
