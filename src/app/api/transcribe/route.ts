import { NextRequest, NextResponse } from "next/server";
import { transcribeAudio } from "@/lib/api/groq";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { fileUrl } = body;

        if (!fileUrl) {
            return NextResponse.json(
                { error: "No file URL provided" },
                { status: 400 }
            );
        }

        // Fetch file from cloud storage URL
        const response = await fetch(fileUrl);
        if (!response.ok) {
            throw new Error(`Failed to fetch file from cloud storage: ${response.statusText}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        const fileBuffer = Buffer.from(arrayBuffer);
        const filename = fileUrl.split('/').pop() || "audio-file";

        // Transcribe using Groq
        const result = await transcribeAudio(fileBuffer, filename);

        return NextResponse.json({
            success: true,
            transcript: result.text,
            segments: result.segments,
        });
    } catch (error) {
        console.error("Transcription error:", error);
        return NextResponse.json(
            {
                error: "Transcription failed",
                details: error instanceof Error ? error.message : "Unknown error"
            },
            { status: 500 }
        );
    }
}

export const maxDuration = 60; // 60 seconds timeout for transcription
