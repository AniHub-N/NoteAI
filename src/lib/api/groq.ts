import Groq from "groq-sdk";

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

export interface TranscriptionResult {
    text: string;
    segments: Array<{
        id: string | number;
        start: number;
        end: number;
        text: string;
        speaker?: string;
    }>;
}

export async function transcribeAudio(
    audioFile: File | Buffer,
    filename: string
): Promise<TranscriptionResult> {
    try {
        // Convert Buffer to File if needed
        let file: File;
        if (audioFile instanceof Buffer) {
            const uint8Array = new Uint8Array(audioFile);
            const blob = new Blob([uint8Array], { type: "audio/mpeg" });
            file = new File([blob], filename, { type: "audio/mpeg" });
        } else {
            file = audioFile as any;
        }

        // Call Groq Whisper API
        const transcription = await groq.audio.transcriptions.create({
            file: file,
            model: "whisper-large-v3",
            response_format: "verbose_json",
            language: "en",
        });

        // Parse segments - Groq returns them in verbose_json mode
        const segments = ((transcription as any).segments || []).map((seg: any, idx: number) => ({
            id: idx + 1,
            start: seg.start,
            end: seg.end,
            text: seg.text.trim(),
            speaker: "Speaker", // Groq doesn't provide speaker diarization
        }));

        return {
            text: transcription.text,
            segments,
        };
    } catch (error) {
        console.error("Groq transcription error:", error);
        throw new Error(`Transcription failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
