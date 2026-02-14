"use client";

import { useState, useEffect } from "react";
import { TranscriptView } from "@/components/lecture-view/transcript-view";
import { SummaryView } from "@/components/lecture-view/summary-view";
import { QuizView } from "@/components/lecture-view/quiz-view";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Sparkles, ExternalLink, AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function SharedLecturePage() {
    const params = useParams();
    const shareId = params?.shareId as string;
    const [activeTab, setActiveTab] = useState("study");
    const [lecture, setLecture] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!shareId) return;

        const fetchLecture = async () => {
            try {
                setLoading(true);
                const { data, error: dbError } = await supabase
                    .from("lectures")
                    .select("*")
                    .eq("id", shareId)
                    .single();

                if (dbError) throw dbError;
                if (!data) throw new Error("Lecture not found");

                setLecture(data);
            } catch (err: any) {
                console.error("Fetch shared lecture error:", err);
                setError(err.message || "Failed to load shared lecture");
            } finally {
                setLoading(false);
            }
        };

        fetchLecture();
    }, [shareId]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-50 dark:bg-black">
                <Loader2 className="h-10 w-10 text-indigo-600 animate-spin mb-4" />
                <p className="text-zinc-500 font-medium">Loading lecture notes...</p>
            </div>
        );
    }

    if (error || !lecture) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-50 dark:bg-black p-6 text-center">
                <AlertCircle className="h-16 w-16 text-red-500 mb-6" />
                <h1 className="text-2xl font-bold mb-2">Oops! Something went wrong</h1>
                <p className="text-zinc-500 max-w-md mb-8">
                    {error === "JSON object requested, multiple (or no) rows returned"
                        ? "We couldn't find the lecture notes you're looking for. The link might be incorrect or expired."
                        : error || "Failed to load lecture notes."}
                </p>
                <Link href="/">
                    <Button className="bg-indigo-600">Go to Homepage</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-black animate-fade-in">
            {/* Header */}
            <header className="h-16 border-b bg-white dark:bg-zinc-900 flex items-center justify-between px-6 shrink-0">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 font-bold text-xl tracking-tighter">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
                            <Sparkles className="h-5 w-5 text-white" />
                        </div>
                        <span>NotesAI</span>
                    </div>
                    <Separator orientation="vertical" className="h-6" />
                    <div>
                        <h1 className="font-semibold text-lg leading-tight truncate max-w-md">{lecture.title}</h1>
                        <p className="text-xs text-zinc-500">
                            {lecture.course_name || "General Course"} • {lecture.professor_name || "Unknown Professor"}
                        </p>
                    </div>
                </div>
                <Link href="/">
                    <Button className="bg-indigo-600 hover:bg-indigo-700">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Create Your Own
                    </Button>
                </Link>
            </header>

            {/* Banner */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-3 text-center text-sm font-medium">
                📚 This is a shared study guide. Sign up to create your own from any audio or video!
            </div>

            {/* Main Content */}
            <main className="flex-1 overflow-hidden">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                    <div className="px-6 py-2 border-b bg-white dark:bg-zinc-900 overflow-x-auto">
                        <TabsList className="bg-zinc-100 dark:bg-zinc-800">
                            <TabsTrigger value="study">Study Guide</TabsTrigger>
                            <TabsTrigger value="quiz">Practice Quiz</TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="study" className="flex-1 m-0 overflow-hidden">
                        <div className="grid grid-cols-1 lg:grid-cols-2 h-full">
                            <div className="border-r border-zinc-200 dark:border-zinc-800 overflow-y-auto">
                                <TranscriptView transcript={lecture.transcript || []} />
                            </div>
                            <div className="overflow-y-auto">
                                <SummaryView summary={lecture.summary || {}} />
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="quiz" className="flex-1 m-0 overflow-y-auto p-6 bg-zinc-50 dark:bg-black">
                        <div className="max-w-3xl mx-auto">
                            <QuizView questions={lecture.quiz || []} />
                        </div>
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    );
}
