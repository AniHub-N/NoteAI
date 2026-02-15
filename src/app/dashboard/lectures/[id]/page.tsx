"use client";

import { useState } from "react";
import { TranscriptView } from "@/components/lecture-view/transcript-view";
import { SummaryView } from "@/components/lecture-view/summary-view";
import { QuizView } from "@/components/lecture-view/quiz-view";
import { Lecture } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, PlayCircle } from "lucide-react";
import { ExportButton } from "@/components/lecture-view/export-button";
import { ShareDialog } from "@/components/lecture-view/share-dialog";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";

// MOCK DATA
const MOCK_LECTURE: Lecture = {
    id: "1",
    title: "Introduction to Microeconomics: Supply and Demand",
    date: "2023-10-15",
    duration: 3600,
    course: "ECON 101",
    professor: "Dr. Sarah Miller",
    transcript: [
        { id: "1", start: 0, end: 30, text: "Okay everyone, let's get started. Today we're going to talk about the fundamental forces of the market: Supply and Demand.", speaker: "Dr. Miller" },
        { id: "2", start: 30, end: 60, text: "Supply and demand is really an economic model of price determination in a market.", speaker: "Dr. Miller" },
        { id: "3", start: 60, end: 90, text: "It postulates that, holding all else equal, in a competitive market, the unit price for a particular good, or other traded item such as labor or liquid financial assets, will vary until it settles at a point where the quantity demanded (at the current price) will equal the quantity supplied (at the current price), resulting in an economic equilibrium for price and quantity transacted.", speaker: "Dr. Miller" },
        { id: "4", start: 90, end: 120, text: "Let's break that down. What determines demand? Well, price is the most obvious factor.", speaker: "Dr. Miller" },
        { id: "5", start: 120, end: 150, text: "But there are other determinants: income, tastes and preferences, prices of related goods like substitutes and complements.", speaker: "Dr. Miller" },
    ],
    summary: {
        executiveSummary: "This lecture covers the foundational concepts of Supply and Demand in microeconomics. Dr. Miller explains how these two forces interact to determine market prices and quantities. The lecture explores the Law of Demand (inverse relationship between price and quantity demanded) and the Law of Supply (direct relationship). Key determinants for both curves are discussed, including income, tastes, and production costs. The concept of Market Equilibrium is introduced as the point where supply equals demand.",
        keyTopics: [
            { timestamp: 0, topic: "Introduction to Market Forces" },
            { timestamp: 60, topic: "Definition of Economic Equilibrium" },
            { timestamp: 90, topic: "Determinants of Demand" },
            { timestamp: 120, topic: "Substitutes and Complements" }
        ],
        takeaways: [
            "Price and Quantity Demanded have an inverse relationship (Law of Demand).",
            "Supply curve slopes upward; Demand curve slopes downward.",
            "Equilibrium is where the two curves intersect.",
            "Shifts in the curves change the equilibrium price and quantity."
        ],
        definitions: [
            { term: "Equilibrium", definition: "A state where economic forces such as supply and demand are balanced." },
            { term: "Substitutes", definition: "Goods that can be used in place of another (e.g., coffee vs tea)." },
            { term: "Complements", definition: "Goods that are consumed together (e.g., coffee and sugar)." }
        ]
    },
    quiz: [
        {
            id: "q1",
            question: "What is the relationship between price and quantity demanded according to the Law of Demand?",
            options: ["Direct relationship", "Inverse relationship", "No relationship", "Exponential relationship"],
            correctAnswer: 1,
            explanation: "The Law of Demand states that as price increases, quantity demanded decreases, and vice versa.",
            difficulty: "easy"
        },
        {
            id: "q2",
            question: "If the price of Coffee increases, what happens to the demand for Tea (a substitute)?",
            options: ["Demand for Tea decreases", "Demand for Tea increases", "Demand for Tea stays the same", "Supply of Tea decreases"],
            correctAnswer: 1,
            explanation: "Since Tea is a substitute, consumers will switch to it when Coffee becomes more expensive, increasing demand for Tea.",
            difficulty: "medium"
        },
        {
            id: "q3",
            question: "Which of the following would shift the Supply curve to the right?",
            options: ["Increase in production costs", "Decrease in number of sellers", "Technological advancement", "Increase in price of the good"],
            correctAnswer: 2,
            explanation: "Technological advancements make production more efficient, allowing suppliers to produce more at the same price, shifting the curve right.",
            difficulty: "hard"
        }
    ]
};

import { useParams } from "next/navigation";
import { useEffect } from "react";

import { supabase } from "@/lib/supabase";


export default function LecturePage() {
    const params = useParams();
    const id = params?.id as string;

    const [lecture, setLecture] = useState<Lecture | null>(null);
    const [activeTab, setActiveTab] = useState("study");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;

        const fetchLecture = async () => {
            setLoading(true);

            // 1. Try localStorage first (fastest for current session)
            const history = JSON.parse(localStorage.getItem("notesai_history") || "[]");
            const localFound = history.find((h: any) => h.id === id || h.slug === id);

            if (localFound) {
                setLecture(localFound);
                setLoading(false);
                return;
            }

            // 2. Fallback to Mock for demo ID
            if (id === "1") {
                setLecture(MOCK_LECTURE);
                setLoading(false);
                return;
            }

            // 3. Fetch from Supabase (Persistence across versions/devices)
            try {
                const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
                let query = supabase.from("lectures").select("*");

                if (isUuid) {
                    query = query.or(`id.eq.${id},slug.eq.${id}`);
                } else {
                    query = query.eq("slug", id);
                }

                const { data, error } = await query.single();

                if (error) {
                    console.error("Supabase fetch error:", error);
                    setLoading(false);
                    return;
                }

                if (data) {
                    const formatted: Lecture = {
                        id: data.id,
                        title: data.title,
                        date: new Date(data.created_at).toISOString().split('T')[0],
                        duration: data.duration,
                        course: data.course_name,
                        professor: data.professor_name,
                        transcript: data.transcript,
                        summary: data.summary,
                        quiz: data.quiz,
                        fileUrl: data.file_url,
                        slug: data.slug
                    };
                    setLecture(formatted);
                }
            } catch (err) {
                console.error("Error fetching from Supabase:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchLecture();
    }, [id]);

    if (!lecture) {
        return (
            <div className="flex items-center justify-center h-screen bg-zinc-50 dark:bg-black">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-zinc-500">Loading your lecture notes...</p>
                </div>
            </div>
        );
    }

    const lectureTitle = lecture.title;
    const lectureCourse = lecture.course;
    const lectureProfessor = lecture.professor;
    const fileUrl = lecture.fileUrl;

    const isVideo = fileUrl?.match(/\.(mp4|webm|ogg)$/i);
    const isAudio = fileUrl?.match(/\.(mp3|wav|m4a|aac)$/i);

    return (
        <div className="flex flex-col h-screen bg-zinc-50 dark:bg-black">
            {/* Header */}
            <header className="h-16 border-b bg-white dark:bg-zinc-900 flex items-center justify-between px-6 shrink-0">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div className="min-w-0">
                        <h1 className="font-semibold text-lg leading-tight truncate max-w-md">{lectureTitle}</h1>
                        <p className="text-xs text-zinc-500 truncate">{lectureCourse} • {lectureProfessor}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg">
                        <TabsList>
                            <TabsTrigger value="study" className="px-4">Study Mode</TabsTrigger>
                            <TabsTrigger value="quiz" className="px-4">Quiz Mode</TabsTrigger>
                        </TabsList>
                    </Tabs>
                    <Separator orientation="vertical" className="h-6 mx-2" />
                    <ShareDialog
                        lectureId={id as string}
                        lectureTitle={lectureTitle}
                        lectureSlug={lecture.slug}
                    />
                    <ExportButton
                        lectureTitle={lectureTitle}
                        lectureCourse={lectureCourse}
                        lectureProfessor={lectureProfessor}
                        transcript={lecture.transcript}
                        summary={lecture.summary}
                    />
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-hidden">
                {activeTab === "study" ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 h-full">
                        {/* L: Transcription / Media Player */}
                        <div className="border-r border-zinc-200 dark:border-zinc-800 flex flex-col h-full bg-white dark:bg-zinc-900">
                            {/* Media Player */}
                            <div className="bg-black flex items-center justify-center shrink-0 border-b border-zinc-200 dark:border-zinc-800">
                                {fileUrl ? (
                                    <div className="w-full aspect-video flex items-center justify-center bg-black">
                                        {isVideo ? (
                                            <video
                                                src={fileUrl}
                                                controls
                                                className="w-full h-full max-h-[40vh]"
                                                playsInline
                                            />
                                        ) : isAudio ? (
                                            <div className="w-full p-8 flex flex-col items-center gap-4">
                                                <div className="h-20 w-20 rounded-full bg-indigo-600/10 flex items-center justify-center">
                                                    <PlayCircle className="h-10 w-10 text-indigo-600" />
                                                </div>
                                                <audio
                                                    src={fileUrl}
                                                    controls
                                                    className="w-full max-w-md"
                                                />
                                            </div>
                                        ) : (
                                            <div className="text-zinc-500 flex flex-col items-center gap-2">
                                                <PlayCircle className="h-12 w-12 opacity-50" />
                                                <p className="text-sm">Unsupported media format</p>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="h-48 flex items-center justify-center text-zinc-500">
                                        <p className="text-sm italic">No media file associated with this lecture</p>
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <TranscriptView transcript={lecture.transcript} />
                            </div>
                        </div>

                        {/* R: Summary / AI Insights */}
                        <div className="h-full bg-zinc-50 dark:bg-black overflow-hidden">
                            <SummaryView summary={lecture.summary} />
                        </div>
                    </div>
                ) : (
                    <div className="h-full overflow-auto bg-zinc-50 dark:bg-black p-6">
                        <div className="max-w-4xl mx-auto">
                            <div className="mb-8 text-center">
                                <h2 className="text-2xl font-bold mb-2">Knowledge Check</h2>
                                <p className="text-zinc-500">Test your understanding of {lecture.title}</p>
                            </div>
                            <QuizView questions={lecture.quiz} />
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
