export interface BlogPost {
    id: string;
    time: string; // ISO date string
    title: string;
    content: string;
    resources?: string[];
    youtubeLink?: string;
}
