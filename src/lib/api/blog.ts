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

        // Robust CSV parser to handle multiline quoted content, now supporting optional 3rd column (Chinese)
        // Format: ID, "English Content", "Chinese Content"(optional)
        const rows: { datetime: string; content: string; chineseContent?: string }[] = [];

        // Regex explanations:
        // ^(\d{12})       -> Group 1: ID (Datetime) at start of line
        // ,"((?:[^"]|"")*)" -> Group 2: English Content (quoted, double quotes escaped as "")
        // (?:,"((?:[^"]|"")*)")? -> Group 3: Chinese Content (optional, quoted)
        const regex = /^(\d{12}),"((?:[^"]|"")*)"(?:,"((?:[^"]|"")*)")?/gm;
        let match;

        while ((match = regex.exec(csvText)) !== null) {
            const datetime = match[1];
            // Unescape double quotes
            const content = match[2].replace(/""/g, '"');
            const chineseContent = match[3] ? match[3].replace(/""/g, '"') : undefined;
            rows.push({ datetime, content, chineseContent });
        }

        if (rows.length === 0 && csvText.trim().length > 0) {
            // Fallback for simple non-quoted format if regex fails (legacy support, mostly for simple 2-col)
            csvText.split('\n').forEach(row => {
                const firstCommaIndex = row.indexOf(',');
                if (firstCommaIndex !== -1) {
                    const datetime = row.substring(0, firstCommaIndex).trim();
                    const rest = row.substring(firstCommaIndex + 1).trim();

                    // Simple split if 3rd col exists but assume no commas in content (risky fallback)
                    // Better to just support 2 col fallback for now
                    const content = rest.replace(/^"|"$/g, '').replace(/""/g, '"');

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
                chineseContent: row.chineseContent,
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

