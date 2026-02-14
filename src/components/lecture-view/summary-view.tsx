import { LectureSummary } from "@/lib/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { List, Book, Lightbulb, Type } from "lucide-react";

interface SummaryViewProps {
    summary: LectureSummary;
}

export function SummaryView({ summary }: SummaryViewProps) {
    return (
        <div className="h-full flex flex-col">
            <Tabs defaultValue="key-points" className="flex-1 flex flex-col">
                <div className="px-4 pt-4">
                    <TabsList className="w-full justify-start">
                        <TabsTrigger value="key-points" className="flex-1"><List className="mr-2 h-4 w-4" />Topics</TabsTrigger>
                        <TabsTrigger value="summary" className="flex-1"><Type className="mr-2 h-4 w-4" />Summary</TabsTrigger>
                        <TabsTrigger value="definitions" className="flex-1"><Book className="mr-2 h-4 w-4" />Terms</TabsTrigger>
                    </TabsList>
                </div>

                <div className="flex-1 overflow-hidden">
                    <ScrollArea className="h-full p-4">
                        <TabsContent value="key-points" className="mt-0 space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center text-base">
                                        <Lightbulb className="mr-2 h-4 w-4 text-amber-500" />
                                        Main Takeaways
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className="list-disc list-outside ml-4 space-y-2 text-sm text-zinc-700 dark:text-zinc-300">
                                        {summary.takeaways.map((point, i) => (
                                            <li key={i}>{point}</li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>

                            <div className="space-y-2">
                                <h3 className="font-medium text-sm text-zinc-500 px-1">Key Topics & Timestamps</h3>
                                {summary.keyTopics.map((topic, i) => (
                                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg border bg-card text-card-foreground shadow-sm">
                                        <span className="text-xs font-mono bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded text-zinc-500 mt-0.5">
                                            {Math.floor(topic.timestamp / 60)}:{Math.floor(topic.timestamp % 60).toString().padStart(2, '0')}
                                        </span>
                                        <span className="text-sm">{topic.topic}</span>
                                    </div>
                                ))}
                            </div>
                        </TabsContent>

                        <TabsContent value="summary" className="mt-0">
                            <div className="prose dark:prose-invert prose-sm max-w-none">
                                <h3 className="text-lg font-semibold mb-2">Executive Summary</h3>
                                <p className="whitespace-pre-line text-zinc-700 dark:text-zinc-300 leading-relaxed">
                                    {summary.executiveSummary}
                                </p>
                            </div>
                        </TabsContent>

                        <TabsContent value="definitions" className="mt-0 space-y-3">
                            {summary.definitions.map((def, i) => (
                                <Card key={i}>
                                    <CardContent className="pt-4">
                                        <div className="mb-1 font-semibold text-indigo-600 dark:text-indigo-400">
                                            {def.term}
                                        </div>
                                        <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                            {def.definition}
                                        </p>
                                    </CardContent>
                                </Card>
                            ))}
                        </TabsContent>
                    </ScrollArea>
                </div>
            </Tabs>
        </div>
    );
}
