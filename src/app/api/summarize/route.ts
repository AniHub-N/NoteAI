import { NextRequest, NextResponse } from "next/server";
import { generateSummary } from "@/lib/api/gemini";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { transcript } = body;

        if (!transcript) {
            return NextResponse.json(
                { error: "No transcript provided" },
                { status: 400 }
            );
        }

        // Generate summary using Gemini
        const summary = await generateSummary(transcript);

        return NextResponse.json({
            success: true,
            summary,
        });
    } catch (error) {
        console.error("Summarization error:", error);
        return NextResponse.json(
            {
                error: "Summarization failed",
                details: error instanceof Error ? error.message : "Unknown error"
            },
            { status: 500 }
        );
    }
}

export const maxDuration = 30;
