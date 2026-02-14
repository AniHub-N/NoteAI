import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function POST(request: NextRequest) {
    try {
        // Get user ID (optional for now)
        let userId = "anonymous";
        try {
            const authResult = await auth();
            userId = authResult.userId || "anonymous";
        } catch (authError) {
            console.log("Auth skipped:", authError);
            // Continue without auth for testing
        }

        const body = await request.json();
        const { fileUrl, filename, courseName, professorName } = body;

        if (!fileUrl) {
            return NextResponse.json(
                { error: "File URL required" },
                { status: 400 }
            );
        }

        // Create a readable stream for progress updates
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            async start(controller) {
                const sendUpdate = (stage: string, progress: number, message: string) => {
                    controller.enqueue(
                        encoder.encode(`data: ${JSON.stringify({ stage, progress, message })}\n\n`)
                    );
                };

                try {
                    // Step 1: Transcribe
                    sendUpdate("transcribe", 20, "Transcribing audio...");
                    const transcribeRes = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/transcribe`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ fileUrl }),
                    });

                    if (!transcribeRes.ok) {
                        const errData = await transcribeRes.json().catch(() => ({}));
                        throw new Error(`Transcription failed: ${errData.details || errData.error || transcribeRes.statusText}`);
                    }

                    const { transcript, segments } = await transcribeRes.json();
                    sendUpdate("transcribe", 40, "Transcription complete!");

                    // Step 2: Summarize
                    sendUpdate("summarize", 50, "Generating summary...");
                    const summarizeRes = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/summarize`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ transcript }),
                    });

                    if (!summarizeRes.ok) {
                        const errData = await summarizeRes.json().catch(() => ({}));
                        throw new Error(`Summarization failed: ${errData.details || errData.error || summarizeRes.statusText}`);
                    }

                    const { summary: summaryData } = await summarizeRes.json();
                    const aiTitle = summaryData.title;
                    const finalSummary = { ...summaryData };
                    delete finalSummary.title; // Keep the summary object clean

                    sendUpdate("summarize", 70, "Summary complete!");

                    // Step 3: Generate Quiz
                    sendUpdate("quiz", 80, "Creating quiz questions...");
                    const quizRes = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/quiz`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ transcript, summary: finalSummary }),
                    });

                    if (!quizRes.ok) {
                        const errData = await quizRes.json().catch(() => ({}));
                        throw new Error(`Quiz generation failed: ${errData.details || errData.error || quizRes.statusText}`);
                    }

                    const { quiz } = await quizRes.json();
                    sendUpdate("quiz", 90, "Quiz complete!");

                    // Resolve Title: Use AI title if original filename is generic or not provided
                    const isGenericName = !filename || filename.startsWith("recording-") || filename.toLowerCase().includes("upload");
                    const finalTitle = isGenericName ? aiTitle : filename;

                    // Step 4: Save to database (optional)
                    sendUpdate("save", 95, "Saving lecture...");

                    let lectureId = `local-${Date.now()}`; // Unique ID for local mode

                    // Only try to save if Supabase is configured
                    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
                        try {
                            const { supabaseAdmin } = await import("@/lib/supabase");
                            const { data: lecture, error: dbError } = await supabaseAdmin
                                .from("lectures")
                                .insert({
                                    user_id: userId,
                                    title: finalTitle || "Untitled Lecture",
                                    course_name: courseName || null,
                                    professor_name: professorName || null,
                                    file_url: fileUrl,
                                    transcript: segments,
                                    summary: finalSummary,
                                    quiz: quiz,
                                    duration: segments[segments.length - 1]?.end || 0,
                                })
                                .select()
                                .single();

                            if (dbError) {
                                console.error("Database error:", dbError);
                            } else if (lecture) {
                                lectureId = lecture.id;
                            }
                        } catch (dbErr) {
                            console.error("Database save failed:", dbErr);
                            // Continue without saving
                        }
                    } else {
                        console.log("Supabase not configured, skipping database save");
                    }

                    sendUpdate("complete", 100, "Processing complete!");

                    // Send final result
                    controller.enqueue(
                        encoder.encode(
                            `data: ${JSON.stringify({
                                stage: "done",
                                lectureId: lectureId,
                                title: finalTitle,
                                transcript: segments,
                                summary: finalSummary,
                                quiz,
                                fileUrl: fileUrl,
                            })}\n\n`
                        )
                    );

                    controller.close();
                } catch (error) {
                    console.error("Processing pipeline error:", error);
                    const errorMessage = error instanceof Error ? error.message : "Processing failed";
                    console.error("Error details:", errorMessage);

                    controller.enqueue(
                        encoder.encode(
                            `data: ${JSON.stringify({
                                stage: "error",
                                error: errorMessage,
                            })}\n\n`
                        )
                    );
                    controller.close();
                }
            },
        });

        return new Response(stream, {
            headers: {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                Connection: "keep-alive",
            },
        });
    } catch (error) {
        console.error("Process error:", error);
        return NextResponse.json(
            { error: "Processing failed" },
            { status: 500 }
        );
    }
}

export const maxDuration = 300; // 5 minutes for full processing
