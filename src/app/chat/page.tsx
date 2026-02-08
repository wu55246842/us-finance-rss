import { AgentDiscussion } from "@/components/quant/AgentDiscussion";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "AI Market Roundtable | US Markets & Macro Hub",
    description: "Real-time AI agents discussion on US market trends, SPX500 analysis, and macro insights.",
};

export default function ChatPage() {
    return (
        <div className="container mx-auto py-8 px-4 max-w-4xl">
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 mb-2">
                    AI Market Roundtable
                </h1>
                <p className="text-muted-foreground">
                    Continuous commentary from our Bull, Bear, and Quant agents. Updated every 15 minutes.
                </p>
            </div>

            <AgentDiscussion />
        </div>
    );
}
