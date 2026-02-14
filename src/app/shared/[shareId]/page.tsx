"use client";

import { useState } from "react";
import { TranscriptView } from "@/components/lecture-view/transcript-view";
import { SummaryView } from "@/components/lecture-view/summary-view";
import { QuizView } from "@/components/lecture-view/quiz-view";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { BookOpen, FileText, Sparkles, ExternalLink } from "lucide-react";
import Link from "next/link";

// Mock data - same as lecture view
const MOCK_LECTURE = {
    id: "1",
    title: "Introduction to Economics",
    date: "2024-02-10",
    duration: 2700,
    course: "ECON 101",
    professor: "Prof. Johnson",
    transcript: [
        { id: "1", start: 0, end: 15, text: "Welcome everyone to today's lecture on supply and demand.", speaker: "Prof. Johnson" },
        { id: "2", start: 15, end: 30, text: "We'll be covering the fundamental principles that govern market economies.", speaker: "Prof. Johnson" },
    ],
    summary: {
        executiveSummary: "This lecture introduces the fundamental concepts of supply and demand in economics, exploring how market forces determine prices and quantities in a free market system.",
        keyTopics: [
            { timestamp: 120, topic: "Law of Supply" },
            { timestamp: 450, topic: "Law of Demand" },
            { timestamp: 890, topic: "Market Equilibrium" },
        ],
        takeaways: ["Supply and demand determine market prices", "Equilibrium occurs where supply meets demand"],
        definitions: [
            { term: "Supply", definition: "The quantity of a good or service that producers are willing to offer at various prices." },
            { term: "Demand", definition: "The quantity of a good or service that consumers are willing to purchase at various prices." },
        ],
    },
    quiz: [
        {
            id: "1",
            question: "What happens to price when demand increases and supply remains constant?",
            options: ["Price decreases", "Price increases", "Price stays the same", "Price becomes zero"],
            correctAnswer: 1,
            explanation: "When demand increases while supply remains constant, competition among buyers drives the price up.",
            difficulty: "easy" as const,
        },
    ],
};

import { useParams } from "next/navigation";

export default function SharedLecturePage() {
    const params = useParams();
    const shareId = params?.shareId;
    const [activeTab, setActiveTab] = useState("study");

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
                        <h1 className="font-semibold text-lg leading-tight truncate max-w-md">{MOCK_LECTURE.title}</h1>
                        <p className="text-xs text-zinc-500">{MOCK_LECTURE.course} • {MOCK_LECTURE.professor}</p>
                    </div>
                </div>
                <Link href="/dashboard">
                    <Button className="bg-indigo-600 hover:bg-indigo-700">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Create Your Own
                    </Button>
                </Link>
            </header>

            {/* Banner */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-3 text-center text-sm">
                📚 This is a shared lecture note. Sign up to create your own AI-powered study guides!
            </div>

            {/* Main Content */}
            <main className="flex-1 overflow-hidden">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
                    <TabsContent value="study" className="h-full m-0">
                        <div className="grid grid-cols-1 lg:grid-cols-2 h-full">
                            <div className="border-r border-zinc-200 dark:border-zinc-800 overflow-y-auto">
                                <TranscriptView transcript={MOCK_LECTURE.transcript} />
                            </div>
                            <div className="overflow-y-auto">
                                <SummaryView summary={MOCK_LECTURE.summary} />
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    );
}
