import { TranscriptSegment } from "@/lib/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface TranscriptViewProps {
    transcript: TranscriptSegment[];
    currentTime?: number;
    onSeek?: (time: number) => void;
}

function formatTime(seconds: number) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function TranscriptView({ transcript, currentTime = 0, onSeek }: TranscriptViewProps) {
    return (
        <div className="h-full flex flex-col">
            <div className="p-4 border-b bg-zinc-50 dark:bg-zinc-900/50">
                <h3 className="font-semibold">Transcript</h3>
            </div>
            <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                    {transcript.map((segment) => {
                        const isActive = currentTime >= segment.start && currentTime < segment.end;
                        return (
                            <div
                                key={segment.id}
                                className={cn(
                                    "p-2 rounded-lg transition-colors cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800",
                                    isActive && "bg-indigo-50 dark:bg-indigo-900/20 border-l-2 border-indigo-500"
                                )}
                                onClick={() => onSeek?.(segment.start)}
                            >
                                <div className="flex justify-between text-xs text-zinc-500 mb-1">
                                    <span className="font-medium text-zinc-700 dark:text-zinc-300">{segment.speaker || "Speaker"}</span>
                                    <span className="font-mono">{formatTime(segment.start)}</span>
                                </div>
                                <p className="text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed">
                                    {segment.text}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </ScrollArea>
        </div>
    );
}
