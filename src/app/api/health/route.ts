import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        // Check environment variables
        const hasGroq = !!process.env.GROQ_API_KEY;
        const hasGemini = !!process.env.GOOGLE_AI_API_KEY;
        const hasSupabase = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
        const hasServiceKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;

        // Test Gemini API
        let geminiStatus = "not configured";
        if (hasGemini) {
            try {
                const { GoogleGenerativeAI } = await import("@google/generative-ai");
                const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || "");
                const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

                const result = await model.generateContent("Say 'Hello'");
                const response = result.response.text();
                geminiStatus = response.includes("Hello") ? "working ✅" : "configured but response unexpected";
            } catch (error) {
                geminiStatus = `error: ${error instanceof Error ? error.message : 'unknown'}`;
            }
        }

        // Test Supabase Storage
        let supabaseStatus = "not configured";
        if (hasSupabase && hasServiceKey) {
            try {
                const { supabaseAdmin } = await import("@/lib/supabase");
                const { data, error } = await supabaseAdmin.storage.getBucket("lectures");
                if (error) throw error;
                supabaseStatus = data ? `bucket 'lectures' found ✅` : "bucket 'lectures' not found ❌";
            } catch (error) {
                supabaseStatus = `error: ${error instanceof Error ? error.message : 'unknown'}`;
            }
        }

        return NextResponse.json({
            status: "API Health Check",
            apis: {
                groq: hasGroq ? "configured ✅" : "not configured ❌",
                gemini: geminiStatus,
                supabase: supabaseStatus,
                serviceKey: hasServiceKey ? "present ✅" : "missing ❌ (required for upload)",
            },
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        return NextResponse.json(
            {
                error: "Health check failed",
                details: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}

export const maxDuration = 30;
