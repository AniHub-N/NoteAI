import { NextRequest, NextResponse } from "next/server";
import { generateQuiz } from "@/lib/api/gemini";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { transcript, summary } = body;

        if (!transcript || !summary) {
            return NextResponse.json(
                { error: "Transcript and summary required" },
                { status: 400 }
            );
        }

        // Generate quiz using Gemini
        const quiz = await generateQuiz(transcript, summary);

        return NextResponse.json({
            success: true,
            quiz,
        });
    } catch (error) {
        console.error("Quiz generation error:", error);
        return NextResponse.json(
            {
                error: "Quiz generation failed",
                details: error instanceof Error ? error.message : "Unknown error"
            },
            { status: 500 }
        );
    }
}

export const maxDuration = 30;
