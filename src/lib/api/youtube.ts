/**
 * Extracts the video ID from various YouTube URL formats
 */
export function extractVideoId(url: string): string | null {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
}

/**
 * Fetches transcript for a YouTube video using a robust manual approach
 * This handles Vercel blocks better than standard libraries.
 */
export async function getYouTubeTranscript(videoIdOrUrl: string) {
    const videoId = videoIdOrUrl.length === 11 ? videoIdOrUrl : extractVideoId(videoIdOrUrl);

    if (!videoId) {
        throw new Error("Invalid YouTube URL or Video ID");
    }

    try {
        console.log(`Fetching transcript for video: ${videoId}`);

        // Step 1: Fetch the video page to find the caption tracks
        const videoPageResponse = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept-Language': 'en-US,en;q=0.9',
            },
        });

        if (!videoPageResponse.ok) {
            throw new Error(`Failed to fetch YouTube page: ${videoPageResponse.statusText}`);
        }

        const html = await videoPageResponse.text();

        // Step 2: Extract the captions track JSON
        const regex = /"captionTracks":\s*(\[.*?\])/;
        const match = html.match(regex);

        if (!match || !match[1]) {
            // Fallback: Check if common library works as a second attempt
            try {
                const { YoutubeTranscript } = await import('youtube-transcript');
                const transcript = await YoutubeTranscript.fetchTranscript(videoId);
                return transcript.map((item: any, index: number) => ({
                    id: index.toString(),
                    start: item.offset / 1000,
                    end: (item.offset + item.duration) / 1000,
                    text: item.text,
                    speaker: "YouTube Captions"
                }));
            } catch (innerError) {
                console.error("Both manual and library fetch failed.");
                throw new Error("Transcripts are disabled or unavailable for this video. YouTube might be blocking our server requests.");
            }
        }

        const tracks = JSON.parse(match[1]);
        if (tracks.length === 0) {
            throw new Error("No caption tracks found for this video.");
        }

        // Prefer English track, otherwise take the first one
        const track = tracks.find((t: any) => t.languageCode === 'en') || tracks[0];
        const transcriptUrl = track.baseUrl;

        // Step 3: Fetch the actual XML transcript
        const transcriptResponse = await fetch(transcriptUrl);
        if (!transcriptResponse.ok) {
            throw new Error("Failed to fetch transcript XML.");
        }

        const xml = await transcriptResponse.text();

        // Step 4: Simple XML parsing using regex (to avoid heavy xml dependencies)
        const segments: any[] = [];
        const segRegex = /<text start="([\d.]+)" dur="([\d.]+)">(.*?)<\/text>/g;
        let segMatch;
        let index = 0;

        while ((segMatch = segRegex.exec(xml)) !== null) {
            const start = parseFloat(segMatch[1]);
            const duration = parseFloat(segMatch[2]);
            const text = segMatch[3]
                .replace(/&amp;/g, '&')
                .replace(/&quot;/g, '"')
                .replace(/&#39;/g, "'")
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>');

            segments.push({
                id: (index++).toString(),
                start,
                end: start + duration,
                text,
                speaker: "YouTube Captions"
            });
        }

        if (segments.length === 0) {
            throw new Error("Transcript XML was empty or malformed.");
        }

        return segments;
    } catch (error: any) {
        console.error("YouTube transcript fetch error:", error);
        throw new Error(error.message || "Failed to process YouTube transcript.");
    }
}
