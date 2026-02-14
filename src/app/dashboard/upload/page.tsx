"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UploadCloud, Link as LinkIcon, Mic, FileAudio } from "lucide-react";
import { Progress } from "@/components/ui/progress";


export default function UploadPage() {
    const router = useRouter();
    const [isDragOver, setIsDragOver] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [courseName, setCourseName] = useState("");
    const [professorName, setProfessorName] = useState("");
    const [youtubeUrl, setYoutubeUrl] = useState("");

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = () => {
        setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const simulateProcessing = () => {
        setUploading(true);
        const fileName = file ? file.name : "New Recording";
        let p = 0;
        const interval = setInterval(() => {
            p += 10;
            setProgress(p);
            if (p >= 100) {
                clearInterval(interval);
                setUploading(false);
                const params = new URLSearchParams({
                    filename: fileName,
                    ...(courseName && { course: courseName }),
                    ...(professorName && { professor: professorName })
                });
                router.push(`/dashboard/lectures/1?${params.toString()}`);
            }
        }, 500);
    };

    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);
        setProgress(0);

        try {
            // Step 1: Upload file
            const formData = new FormData();
            formData.append("file", file);

            const uploadRes = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            if (!uploadRes.ok) {
                const errorData = await uploadRes.json().catch(() => ({}));
                const errorMessage = errorData.error || `Upload failed: ${uploadRes.status}`;
                console.error("Upload API error:", uploadRes.status, errorData);
                throw new Error(errorMessage);
            }

            const { fileUrl, filename } = await uploadRes.json();
            setProgress(10);

            // Step 2: Process (transcribe, summarize, quiz)
            const processRes = await fetch("/api/process", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    fileUrl,
                    filename,
                    courseName,
                    professorName,
                }),
            });

            if (!processRes.ok) {
                const errorData = await processRes.json().catch(() => ({}));
                if (processRes.status === 403) {
                    alert(errorData.message || "Usage limit reached! Please upgrade to Pro for unlimited lectures.");
                    router.push("/pricing");
                    setUploading(false);
                    return;
                }
                const errorMessage = errorData.error || `Processing failed: ${processRes.status}`;
                console.error("Process API error:", processRes.status, errorData);
                throw new Error(errorMessage);
            }

            // Read streaming response
            const reader = processRes.body?.getReader();
            const decoder = new TextDecoder();

            if (reader) {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value);
                    const lines = chunk.split("\n");

                    for (const line of lines) {
                        if (line.startsWith("data: ")) {
                            const data = JSON.parse(line.slice(6));

                            if (data.stage === "done") {
                                // 1. Create the lecture object
                                const newLecture = {
                                    id: data.lectureId,
                                    title: data.title || filename || file.name,
                                    date: new Date().toISOString().split('T')[0],
                                    duration: data.transcript.length > 0 ? data.transcript[data.transcript.length - 1].end : 0,
                                    course: courseName || "General",
                                    professor: professorName || "Guest Speaker",
                                    transcript: data.transcript,
                                    summary: data.summary,
                                    quiz: data.quiz,
                                    fileUrl: data.fileUrl,
                                };

                                // 2. Save to localStorage for history
                                try {
                                    const history = JSON.parse(localStorage.getItem("notesai_history") || "[]");
                                    const existingIndex = history.findIndex((h: any) => h.id === data.lectureId);

                                    if (existingIndex > -1) {
                                        history[existingIndex] = newLecture;
                                    } else {
                                        history.unshift(newLecture);
                                    }

                                    // Limit history to 20 items
                                    localStorage.setItem("notesai_history", JSON.stringify(history.slice(0, 20)));
                                } catch (e) {
                                    console.error("Failed to save to localStorage:", e);
                                }

                                // 3. Redirect with minimal params
                                setUploading(false);
                                setProgress(100);
                                router.push(`/dashboard/lectures/${data.lectureId}`);
                            } else if (data.stage === "error") {
                                throw new Error(data.error);
                            } else {
                                setProgress(data.progress);
                            }
                        }
                    }
                }
            }
        } catch (error) {
            console.error("Upload error:", error);
            alert(error instanceof Error ? error.message : "Upload failed");
            setUploading(false);
            setProgress(0);
        }
    };


    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
                const recordedFile = new File([audioBlob], `recording-${new Date().getTime()}.wav`, { type: 'audio/wav' });
                setFile(recordedFile);

                // Stop all tracks to release the microphone
                stream.getTracks().forEach(track => track.stop());

                // We'll trigger upload automatically after stopping
                setIsRecording(false);
                setRecordingTime(0);
                if (timerRef.current) clearInterval(timerRef.current);
            };

            mediaRecorder.start();
            setIsRecording(true);

            // Start timer
            setRecordingTime(0);
            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);

        } catch (err) {
            console.error("Error accessing microphone:", err);
            alert("Could not access microphone. Please check permissions.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
        }
    };

    const handleRecord = () => {
        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleUrlSubmit = async () => {
        if (!youtubeUrl) return;

        setUploading(true);
        setProgress(0);

        try {
            // Step 1: Process URL directly
            const processRes = await fetch("/api/process", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    youtubeUrl,
                    courseName,
                    professorName,
                }),
            });

            if (!processRes.ok) {
                const errorData = await processRes.json().catch(() => ({}));
                if (processRes.status === 403) {
                    alert(errorData.message || "Usage limit reached! Please upgrade to Pro for unlimited lectures.");
                    router.push("/pricing");
                    setUploading(false);
                    return;
                }
                const errorMessage = errorData.error || `Processing failed: ${processRes.status}`;
                throw new Error(errorMessage);
            }

            // Read streaming response (same logic as handleUpload)
            const reader = processRes.body?.getReader();
            const decoder = new TextDecoder();

            if (reader) {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value);
                    const lines = chunk.split("\n");

                    for (const line of lines) {
                        if (line.startsWith("data: ")) {
                            const data = JSON.parse(line.slice(6));

                            if (data.stage === "done") {
                                // Save to localStorage, etc. (reuse the logic from handleUpload if possible, but for now duplicate)
                                const newLecture = {
                                    id: data.lectureId,
                                    title: data.title || "YouTube Lecture",
                                    date: new Date().toISOString().split('T')[0],
                                    duration: data.transcript.length > 0 ? data.transcript[data.transcript.length - 1].end : 0,
                                    course: courseName || "General",
                                    professor: professorName || "Guest Speaker",
                                    transcript: data.transcript,
                                    summary: data.summary,
                                    quiz: data.quiz,
                                    fileUrl: youtubeUrl,
                                    slug: data.slug,
                                };

                                const history = JSON.parse(localStorage.getItem("notesai_history") || "[]");
                                const existingIndex = history.findIndex((h: any) => h.id === data.lectureId);
                                if (existingIndex > -1) history[existingIndex] = newLecture;
                                else history.unshift(newLecture);
                                localStorage.setItem("notesai_history", JSON.stringify(history.slice(0, 20)));

                                setUploading(false);
                                setProgress(100);
                                router.push(`/dashboard/lectures/${data.lectureId}`);
                            } else if (data.stage === "error") {
                                throw new Error(data.error);
                            } else {
                                setProgress(data.progress);
                            }
                        }
                    }
                }
            }
        } catch (error) {
            console.error("URL processing error:", error);
            alert(error instanceof Error ? error.message : "Processing failed");
            setUploading(false);
            setProgress(0);
        }
    };

    return (
        <div className="container max-w-3xl py-10 animate-fade-in">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight mb-2">Upload Lecture</h1>
                <p className="text-zinc-500">
                    Upload an audio or video file to generate transcripts, summaries, and quizzes.
                </p>
            </div>

            <div className="mb-6 grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                    <Label htmlFor="course">Course Name (Optional)</Label>
                    <Input
                        id="course"
                        placeholder="e.g., ECON 101"
                        value={courseName}
                        onChange={(e) => setCourseName(e.target.value)}
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="professor">Professor (Optional)</Label>
                    <Input
                        id="professor"
                        placeholder="e.g., Dr. Smith"
                        value={professorName}
                        onChange={(e) => setProfessorName(e.target.value)}
                    />
                </div>
            </div>

            <Tabs defaultValue="upload" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-8">
                    <TabsTrigger value="upload" className="flex items-center gap-2">
                        <UploadCloud className="h-4 w-4" /> Upload File
                    </TabsTrigger>
                    <TabsTrigger value="url" className="flex items-center gap-2">
                        <LinkIcon className="h-4 w-4" /> Header URL
                    </TabsTrigger>
                    <TabsTrigger value="record" className="flex items-center gap-2">
                        <Mic className="h-4 w-4" /> Record
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="upload">
                    <Card className={`border-2 border-dashed transition-colors ${isDragOver ? "border-indigo-500 bg-indigo-50/50" : "border-zinc-200"
                        }`}>
                        <CardContent
                            className="flex flex-col items-center justify-center py-16 text-center"
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                        >
                            {file ? (
                                <div className="w-full max-w-xs">
                                    <div className="flex items-center gap-4 mb-6 p-4 bg-zinc-50 rounded-lg border border-zinc-100">
                                        <div className="h-10 w-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <FileAudio className="h-5 w-5 text-indigo-600" />
                                        </div>
                                        <div className="text-left overflow-hidden">
                                            <p className="font-medium truncate">{file.name}</p>
                                            <p className="text-xs text-zinc-500">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                                        </div>
                                    </div>

                                    {uploading && (
                                        <div className="mb-6 space-y-2">
                                            <Progress value={progress} className="h-2" />
                                            <p className="text-xs text-zinc-500 text-right">{progress}%</p>
                                        </div>
                                    )}

                                    <div className="flex gap-3">
                                        <Button
                                            onClick={() => setFile(null)}
                                            variant="ghost"
                                            disabled={uploading}
                                            className="flex-1"
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            onClick={handleUpload}
                                            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
                                            disabled={uploading}
                                        >
                                            {uploading ? "Uploading..." : "Process Lecture"}
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="mb-4 rounded-full bg-zinc-100 p-4">
                                        <UploadCloud className="h-8 w-8 text-zinc-400" />
                                    </div>
                                    <h3 className="mb-2 text-lg font-semibold">
                                        Drag and drop your file here
                                    </h3>
                                    <p className="mb-6 text-sm text-zinc-500">
                                        Supports MP3, MP4, WAV, M4A up to 500MB
                                    </p>
                                    <div className="relative">
                                        <Button variant="outline">Browse Files</Button>
                                        <Input
                                            type="file"
                                            className="absolute inset-0 cursor-pointer opacity-0"
                                            onChange={handleFileChange}
                                            accept="audio/*,video/*"
                                        />
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="url">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="grid gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="url">YouTube URL</Label>
                                    <Input
                                        id="url"
                                        placeholder="https://www.youtube.com/watch?v=..."
                                        value={youtubeUrl}
                                        onChange={(e) => setYoutubeUrl(e.target.value)}
                                    />
                                </div>
                                <Button onClick={handleUrlSubmit} disabled={uploading}>
                                    {uploading ? "Processing..." : "Fetch & Process"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="record">
                    <Card>
                        <CardContent className="py-16 text-center">
                            <div className={`mb-6 h-20 w-20 mx-auto rounded-full flex items-center justify-center ${isRecording ? "bg-red-100 animate-pulse" : "bg-zinc-100"}`}>
                                <Mic className={`h-8 w-8 ${isRecording ? "text-red-500 animate-ping" : "text-zinc-400"}`} />
                            </div>

                            {isRecording && (
                                <p className="mb-4 text-2xl font-mono font-bold text-red-600">
                                    {formatTime(recordingTime)}
                                </p>
                            )}

                            <div className="flex flex-col items-center gap-4">
                                <Button
                                    size="lg"
                                    variant={isRecording ? "destructive" : "default"}
                                    className={`rounded-full px-8 ${!isRecording ? "bg-indigo-600 hover:bg-indigo-700" : ""}`}
                                    onClick={handleRecord}
                                    disabled={uploading}
                                >
                                    {isRecording ? "Stop Recording" : "Start Recording"}
                                </Button>

                                {file && file.name.startsWith("recording-") && !isRecording && !uploading && (
                                    <div className="mt-4 p-4 bg-indigo-50 rounded-lg border border-indigo-100 w-full max-w-xs">
                                        <div className="flex items-center gap-3 mb-4">
                                            <FileAudio className="h-5 w-5 text-indigo-600" />
                                            <div className="text-left overflow-hidden">
                                                <p className="text-sm font-medium truncate">New Recording</p>
                                                <p className="text-xs text-zinc-500">Ready to process</p>
                                            </div>
                                        </div>
                                        <Button
                                            onClick={handleUpload}
                                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                                        >
                                            Process Recording
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
