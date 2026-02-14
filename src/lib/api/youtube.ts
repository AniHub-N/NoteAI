import { YoutubeTranscript } from 'youtube-transcript';

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
        const transcript = await YoutubeTranscript.fetchTranscript(videoId);

        // Format to match our internal transcript structure
        // Internal structure: { id, start, end, text, speaker }
        return transcript.map((item: any, index: number) => ({
            id: index.toString(),
            start: item.offset / 1000,
            end: (item.offset + item.duration) / 1000,
            text: item.text,
            speaker: "YouTube Captions"
        }));
    } catch (error: any) {
        console.error("YouTube transcript fetch error:", error);
        const detail = error?.message || String(error);
        throw new Error(`YouTube Transcript Error: ${detail}. The video might have disabled captions or YouTube is blocking the request from our server.`);
    }
}
