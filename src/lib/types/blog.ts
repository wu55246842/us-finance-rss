export interface BlogPost {
    id: string;
    time: string; // ISO date string
    title: string;
    content: string;
    type?: 'manual' | 'ai_analysis';
    formattedContent?: string;
    resources?: string[];
    youtubeLink?: string;
}
