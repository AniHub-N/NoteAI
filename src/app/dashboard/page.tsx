"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, Clock, User } from "lucide-react";
import { Lecture } from "@/lib/types";
import { useAuth } from "@clerk/nextjs";
import { supabase } from "@/lib/supabase";

export default function Dashboard() {
    const { userId } = useAuth();
    const [lectures, setLectures] = useState<Lecture[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLectures = async () => {
            if (!userId) {
                // If not logged in, just show nothing or local history
                const history = JSON.parse(localStorage.getItem("notesai_history") || "[]");
                setLectures(history);
                setLoading(false);
                return;
            }

            try {
                const { data, error } = await supabase
                    .from("lectures")
                    .select("*")
                    .eq("user_id", userId)
                    .order("created_at", { ascending: false });

                if (error) throw error;

                if (data && data.length > 0) {
                    const formattedLectures: Lecture[] = data.map(item => ({
                        id: item.id,
                        title: item.title,
                        date: new Date(item.created_at).toISOString().split('T')[0],
                        duration: item.duration,
                        course: item.course_name,
                        professor: item.professor_name,
                        transcript: item.transcript,
                        summary: item.summary,
                        quiz: item.quiz,
                        fileUrl: item.file_url,
                        slug: item.slug
                    }));
                    setLectures(formattedLectures);
                } else {
                    // Fallback to local storage if nothing in DB
                    const history = JSON.parse(localStorage.getItem("notesai_history") || "[]");
                    setLectures(history);
                }
            } catch (err) {
                console.error("Error fetching lectures:", err);
                const history = JSON.parse(localStorage.getItem("notesai_history") || "[]");
                setLectures(history);
            } finally {
                setLoading(false);
            }
        };

        fetchLectures();
    }, [userId]);

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        return `${mins} min`;
    };

    return (
        <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-black">
            <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/50 backdrop-blur-xl px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900/50">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-bold text-zinc-900 dark:text-white">My Lectures</h1>
                    <div className="flex gap-4">
                        <Link href="/pricing">
                            <Button variant="ghost">
                                Pricing
                            </Button>
                        </Link>
                        <Link href="/dashboard/profile">
                            <Button variant="outline" size="icon">
                                <User className="h-4 w-4" />
                            </Button>
                        </Link>
                        <Link href="/dashboard/upload">
                            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                                <Plus className="mr-2 h-4 w-4" />
                                New Lecture
                            </Button>
                        </Link>
                    </div>
                </div>
            </header>

            <main className="flex-1 p-6">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {lectures.map((lecture) => (
                            <Link key={lecture.id} href={`/dashboard/lectures/${lecture.id}`}>
                                <div className="group relative flex flex-col justify-between rounded-xl border border-zinc-200 bg-white p-6 hover:border-indigo-500 transition-all dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-indigo-500 cursor-pointer h-full">
                                    <div>
                                        <div className="flex items-center justify-between mb-4">
                                            <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                                                {lecture.course}
                                            </span>
                                            <span className="text-xs text-zinc-500">{lecture.date}</span>
                                        </div>
                                        <h3 className="font-semibold text-lg leading-tight mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                                            {lecture.title}
                                        </h3>
                                        <p className="text-sm text-zinc-500 line-clamp-2">
                                            {lecture.professor} • {formatDuration(lecture.duration)}
                                        </p>
                                    </div>
                                    <div className="mt-4 flex items-center justify-between text-xs text-zinc-500">
                                        <div className="flex items-center">
                                            <Clock className="mr-1 h-3 w-3" />
                                            Processed
                                        </div>
                                        <span className="font-medium text-indigo-600 dark:text-indigo-400">View Notes →</span>
                                    </div>
                                </div>
                            </Link>
                        ))}

                        {/* New Upload / Empty State */}
                        <Link href="/dashboard/upload" className="h-full">
                            <div className="flex flex-col items-center justify-center h-full rounded-xl border border-dashed border-zinc-300 bg-zinc-50 py-12 text-center hover:bg-zinc-100 transition-colors dark:border-zinc-800 dark:bg-zinc-900/30 dark:hover:bg-zinc-900/50">
                                <div className="mb-4 rounded-full bg-zinc-100 p-3 dark:bg-zinc-800">
                                    <Plus className="h-6 w-6 text-zinc-400" />
                                </div>
                                <p className="text-sm font-medium text-zinc-900 dark:text-white">New Lecture</p>
                                <p className="mt-1 text-xs text-zinc-500">Upload or Record</p>
                            </div>
                        </Link>
                    </div>
                )}
            </main>
        </div>
    );
}
