"use client";

import { Card, CardContent } from "@/components/ui/card";

export function LectureCardSkeleton() {
    return (
        <Card className="animate-pulse">
            <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
                        <div className="space-y-2">
                            <div className="h-4 w-32 bg-zinc-200 dark:bg-zinc-800 rounded" />
                            <div className="h-3 w-24 bg-zinc-200 dark:bg-zinc-800 rounded" />
                        </div>
                    </div>
                    <div className="h-3 w-16 bg-zinc-200 dark:bg-zinc-800 rounded" />
                </div>
                <div className="flex items-center gap-4">
                    <div className="h-3 w-16 bg-zinc-200 dark:bg-zinc-800 rounded" />
                    <div className="h-3 w-20 bg-zinc-200 dark:bg-zinc-800 rounded" />
                </div>
            </CardContent>
        </Card>
    );
}

export function TranscriptSkeleton() {
    return (
        <div className="space-y-4 p-4">
            {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="animate-pulse">
                    <div className="flex gap-3">
                        <div className="h-3 w-12 bg-zinc-200 dark:bg-zinc-800 rounded" />
                        <div className="flex-1 space-y-2">
                            <div className="h-3 w-20 bg-zinc-200 dark:bg-zinc-800 rounded" />
                            <div className="h-3 w-full bg-zinc-200 dark:bg-zinc-800 rounded" />
                            <div className="h-3 w-5/6 bg-zinc-200 dark:bg-zinc-800 rounded" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
