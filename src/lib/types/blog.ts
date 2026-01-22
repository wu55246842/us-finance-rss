export interface BlogPost {
    id: string;
    time: string; // ISO date string
    title: string;
    content: string;
    formattedContent?: string;
    resources?: string[];
    youtubeLink?: string;
}
