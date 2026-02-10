import { unstable_cache } from "next/cache";

const WSCN_API_URL = "https://api-one-wscn.awtmt.com/apiv1/content/lives?channel=us-stock-channel&limit=";

export interface WscnNewsItem {
    id: number;
    title: string;
    content: string;
    content_text: string;
    display_time: number;
    uri: string;
    score: number;
}

export interface WscnResponse {
    code: number;
    data: {
        items: Array<{
            id: number;
            content_text: string;
            display_time: number;
            uri: string;
            score: number;
            title?: string;
        }>;
    };
}

// Cache for 1 minute to avoid hitting rate limits too hard
export const getLiveNews = unstable_cache(
    async (limit = 10): Promise<WscnNewsItem[]> => {
        try {
            const res = await fetch(`${WSCN_API_URL}${limit}`, {
                next: { revalidate: 60 },
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                }
            });

            if (!res.ok) {
                console.error(`Status ${res.status}: Failed to fetch WSCN news`);
                return [];
            }

            const json: WscnResponse = await res.json();
            if (json.code !== 20000 || !json.data?.items) {
                console.error("Invalid WSCN response format", json);
                return [];
            }

            return json.data.items.map(item => ({
                id: item.id,
                // WSCN often puts the main text in content_text and title might be empty for short briefs
                title: item.title || item.content_text.substring(0, 50) + (item.content_text.length > 50 ? "..." : ""),
                content: item.content_text,
                content_text: item.content_text,
                display_time: item.display_time,
                uri: item.uri,
                score: item.score
            }));

        } catch (error) {
            console.error("Error fetching WSCN news:", error);
            return [];
        }
    },
    ["wscn-live-news"],
    { revalidate: 60, tags: ["wscn"] }
);
