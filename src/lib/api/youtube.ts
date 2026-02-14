import { TranscriptClient } from 'youtube-transcript-api';

/**
 * Extracts the video ID from various YouTube URL formats
 */
export function extractVideoId(url: string): string | null {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
}

/**
 * Fetches transcript for a YouTube video
 */
export async function getYouTubeTranscript(videoIdOrUrl: string) {
    const videoId = videoIdOrUrl.length === 11 ? videoIdOrUrl : extractVideoId(videoIdOrUrl);

    if (!videoId) {
        throw new Error("Invalid YouTube URL or Video ID");
    }

    try {
        const transcript = await TranscriptClient.getTranscript(videoId);

        // Format to match our internal transcript structure
        // Internal structure: { id, start, end, text, speaker }
        return transcript.map((item: any, index: number) => ({
            id: index.toString(),
            start: item.offset / 1000, // convert ms to s if needed, but usually it's already in seconds or offset
            end: (item.offset + item.duration) / 1000,
            text: item.text,
            speaker: "YouTube Captions"
        }));
    } catch (error) {
        console.error("YouTube transcript fetch error:", error);
        throw new Error("Could not fetch transcript from YouTube. It might be disabled for this video.");
    }
}
