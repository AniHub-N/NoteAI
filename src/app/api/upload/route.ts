import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json(
                { error: "No file provided" },
                { status: 400 }
            );
        }

        // Validate file type
        const validTypes = [
            "audio/mpeg",
            "audio/mp3",
            "audio/wav",
            "audio/m4a",
            "audio/webm",
            "video/mp4",
            "video/webm",
        ];

        if (!validTypes.includes(file.type)) {
            return NextResponse.json(
                { error: "Invalid file type. Please upload audio or video files." },
                { status: 400 }
            );
        }

        // Validate file size (max 25MB for free tier)
        const maxSize = 25 * 1024 * 1024; // 25MB
        if (file.size > maxSize) {
            return NextResponse.json(
                { error: "File too large. Maximum size is 25MB." },
                { status: 400 }
            );
        }

        // Initialize Supabase Admin for storage operations
        const { supabaseAdmin } = await import("@/lib/supabase");

        // Generate unique filename
        const timestamp = Date.now();
        const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
        const filename = `${timestamp}_${originalName}`;

        // Upload to Supabase Storage
        const bytes = await file.arrayBuffer();
        const { data: uploadData, error: uploadError } = await supabaseAdmin
            .storage
            .from("lectures")
            .upload(filename, bytes, {
                contentType: file.type,
                cacheControl: "3600",
                upsert: false
            });

        if (uploadError) {
            console.error("Supabase Storage error:", uploadError);
            throw new Error(`Upload to cloud failed: ${uploadError.message}`);
        }

        // Get public URL
        const { data: { publicUrl } } = supabaseAdmin
            .storage
            .from("lectures")
            .getPublicUrl(filename);

        return NextResponse.json({
            success: true,
            fileUrl: publicUrl,
            filename: originalName,
            size: file.size,
            type: file.type,
        });
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Upload failed" },
            { status: 500 }
        );
    }
}

export const config = {
    api: {
        bodyParser: false,
    },
};
