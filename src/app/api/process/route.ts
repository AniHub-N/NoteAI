import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function POST(_request: NextRequest) {
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

        const body = await _request.json();
        const { fileUrl, youtubeUrl, filename, courseName, professorName } = body;

        // Usage Limit Check (3 free lectures)
        if (userId !== "anonymous") {
            try {
                const { supabaseAdmin } = await import("@/lib/supabase");
                const { count, error: countError } = await supabaseAdmin
                    .from("lectures")
                    .select("*", { count: "exact", head: true })
                    .eq("user_id", userId);

                if (countError) console.error("Limit check error:", countError);
                else if (count !== null && count >= 3) {
                    return NextResponse.json(
                        {
                            error: "Usage limit reached",
                            message: "You've reached your limit of 3 free lectures. Upgrade to Pro for unlimited access!",
                            limitReached: true
                        },
                        { status: 403 }
                    );
                }
            } catch (err) {
                console.error("Failed to check usage limits:", err);
            }
        }

        if (!fileUrl && !youtubeUrl) {
            return NextResponse.json(
                { error: "File URL or YouTube URL required" },
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
                    let transcript = "";
                    let segments: any[] = [];

                    if (youtubeUrl) {
                        sendUpdate("transcribe", 20, "Fetching YouTube transcript...");
                        const { getYouTubeTranscript } = await import("@/lib/api/youtube");
                        segments = await getYouTubeTranscript(youtubeUrl);
                        transcript = segments.map(s => s.text).join(" ");
                        sendUpdate("transcribe", 40, "YouTube transcript fetched!");
                    } else {
                        sendUpdate("transcribe", 20, "Transcribing audio...");
                        // Import directly to avoid loopback auth issues
                        const { transcribeAudio } = await import("@/lib/api/groq");

                        // Fetch file for transcription
                        const fileResponse = await fetch(fileUrl);
                        if (!fileResponse.ok) {
                            throw new Error(`Failed to fetch file for transcription: ${fileResponse.statusText}`);
                        }
                        const arrayBuffer = await fileResponse.arrayBuffer();
                        const fileBuffer = Buffer.from(arrayBuffer);
                        const audioFilename = (fileUrl || "").split('/').pop() || "audio-file";

                        const result = await transcribeAudio(fileBuffer, audioFilename);
                        transcript = result.text;
                        segments = result.segments;
                        sendUpdate("transcribe", 40, "Transcription complete!");
                    }

                    // Step 2: Summarize
                    sendUpdate("summarize", 50, "Generating summary...");
                    const { generateSummary } = await import("@/lib/api/gemini");
                    const summaryData = await generateSummary(transcript);

                    const aiTitle = summaryData.title;
                    const finalSummary = { ...summaryData };
                    delete finalSummary.title;

                    sendUpdate("summarize", 70, "Summary complete!");

                    // Step 3: Generate Quiz
                    sendUpdate("quiz", 80, "Creating quiz questions...");
                    const { generateQuiz } = await import("@/lib/api/gemini");
                    const quiz = await generateQuiz(transcript, finalSummary);

                    sendUpdate("quiz", 90, "Quiz complete!");

                    // Resolve Title: Prioritize AI title if available, otherwise use filename
                    // AI title is almost always better than a file name like "audio_2023.mp3"
                    const finalTitle = (aiTitle && aiTitle.length > 2) ? aiTitle : (filename || "Untitled Lecture");

                    // Step 4: Save to database (optional)
                    sendUpdate("save", 95, "Saving lecture...");

                    let lectureId = `local-${Date.now()}`; // Unique ID for local mode

                    // Generate a random 6-character slug for sharing
                    const slug = Math.random().toString(36).substring(2, 8);

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
                                    file_url: fileUrl || youtubeUrl,
                                    transcript: segments,
                                    summary: finalSummary,
                                    quiz: quiz,
                                    duration: segments[segments.length - 1]?.end || 0,
                                    slug: slug,
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
                                fileUrl: fileUrl || youtubeUrl,
                                slug: slug,
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
