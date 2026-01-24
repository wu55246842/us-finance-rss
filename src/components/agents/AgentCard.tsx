import { cn } from "@/lib/utils";
import { AgentRole } from "@/lib/agents/core";
import { BrainCircuit, LineChart, Newspaper, Scale, FileText, CheckCircle2 } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import { motion } from 'framer-motion';

interface AgentCardProps {
    title: string;
    role: AgentRole;
    content?: string;
    status?: 'working' | 'done' | 'error';
    className?: string;
    isHighlight?: boolean;
    delay?: number;
}

const RoleIcons: Record<AgentRole, any> = {
    technical: LineChart,
    fundamental: Scale,
    sentiment: Newspaper,
    researcher: BrainCircuit,
    reporter: FileText,
};

export function AgentCard({ title, role, content, status, className, isHighlight, delay = 0 }: AgentCardProps) {
    const Icon = RoleIcons[role] || BrainCircuit;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.4 }}
            className={cn(
                "rounded-xl border border-border bg-card/80 backdrop-blur-sm overflow-hidden transition-all hover:border-primary/50 shadow-sm",
                className
            )}
        >
            {/* Header */}
            <div className="px-5 py-4 border-b border-border/50 flex items-center justify-between bg-muted/30">
                <div className="flex items-center gap-3">
                    <div className={cn("p-2 rounded-lg bg-secondary text-secondary-foreground",
                        role === 'technical' && "text-cyan-600 dark:text-cyan-400 bg-cyan-100 dark:bg-cyan-950/30",
                        role === 'fundamental' && "text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-950/30",
                        role === 'sentiment' && "text-pink-600 dark:text-pink-400 bg-pink-100 dark:bg-pink-950/30",
                        role === 'researcher' && "text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-950/30",
                        role === 'reporter' && "text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/30",
                    )}>
                        <Icon size={20} />
                    </div>
                    <h3 className="font-semibold text-card-foreground">{title}</h3>
                </div>
                {status === 'done' && <CheckCircle2 size={18} className="text-emerald-500" />}
            </div>

            {/* Content */}
            <div className="p-5 text-sm text-muted-foreground leading-relaxed min-h-[150px]">
                {content ? (
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                        <ReactMarkdown>{content}</ReactMarkdown>
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full min-h-[100px] text-muted-foreground/60 italic">
                        Waiting for analysis...
                    </div>
                )}
            </div>
        </motion.div>
    );
}
