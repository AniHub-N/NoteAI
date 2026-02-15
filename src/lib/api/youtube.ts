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
        console.log(`[YouTube] Fetching transcript for: ${videoId}`);

        // Step 1: Fetch the video page
        const response = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
                'Accept-Language': 'en-US,en;q=0.9',
            },
        });

        if (!response.ok) {
            throw new Error(`YouTube page fetch failed: ${response.status}`);
        }

        const html = await response.text();

        // Step 2: Extract ytInitialPlayerResponse or ytInitialData
        // These are the most reliable JSON sources for transcripts
        const sources = [
            { name: 'ytInitialPlayerResponse', regex: /ytInitialPlayerResponse\s*=\s*({.+?})\s*[; <]/ },
            { name: 'ytInitialData', regex: /ytInitialData\s*=\s*({.+?})\s*[; <]/ }
        ];

        let captionTracks = [];

        for (const source of sources) {
            const match = html.match(source.regex);
            if (match) {
                try {
                    const data = JSON.parse(match[1]);
                    // Path for ytInitialPlayerResponse
                    let tracks = data.captions?.playerCaptionsTracklistRenderer?.captionTracks;

                    // Path search for ytInitialData (sometimes it's nested deep)
                    if (!tracks && source.name === 'ytInitialData') {
                        // Deep search helper for captions
                        const findCaptions = (obj: any): any => {
                            if (!obj || typeof obj !== 'object') return null;
                            if (obj.captionTracks) return obj.captionTracks;
                            for (const key in obj) {
                                const result = findCaptions(obj[key]);
                                if (result) return result;
                            }
                            return null;
                        };
                        tracks = findCaptions(data);
                    }

                    if (tracks && Array.isArray(tracks) && tracks.length > 0) {
                        captionTracks = tracks;
                        console.log(`[YouTube] Found ${captionTracks.length} tracks via ${source.name}`);
                        break;
                    }
                } catch (e) {
                    console.error(`[YouTube] Failed to parse ${source.name} JSON`);
                }
            }
        }

        // Step 3: Fallback to old regex if JSON sources failed
        if (captionTracks.length === 0) {
            const legacyMatch = html.match(/"captionTracks":\s*(\[.*?\])/);
            if (legacyMatch) {
                try {
                    captionTracks = JSON.parse(legacyMatch[1]);
                    console.log(`[YouTube] Found ${captionTracks.length} tracks via legacy regex`);
                } catch (e) {
                    console.error("[YouTube] Failed to parse legacy tracks JSON");
                }
            }
        }

        // Step 4: Critical Fallback - Try library 'youtube-transcript'
        if (captionTracks.length === 0) {
            console.log("[YouTube] No tracks found in HTML, trying library fallback...");
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
            } catch (libError) {
                console.error("[YouTube] Library fallback also failed:", libError);
                throw new Error("Captions are unavailable. YouTube is likely blocking automated access from our server. Try a different video or wait a few minutes.");
            }
        }

        // Step 5: Select best track
        const track = captionTracks.find((t: any) => t.languageCode === 'en') ||
            captionTracks.find((t: any) => t.languageCode.startsWith('en')) ||
            captionTracks[0];

        if (!track || !track.baseUrl) {
            throw new Error("Could not find a valid transcript URL.");
        }

        // Step 6: Fetch transcript XML
        const transcriptRes = await fetch(track.baseUrl);
        if (!transcriptRes.ok) {
            throw new Error(`Transcript XML fetch failed: ${transcriptRes.status}`);
        }

        const xml = await transcriptRes.text();

        // Step 7: Parse XML segments
        const segments: any[] = [];
        const segRegex = /<text start="([\d.]+)" dur="([\d.]+)">(.*?)<\/text>/g;
        let match;
        let idx = 0;

        while ((match = segRegex.exec(xml)) !== null) {
            const start = parseFloat(match[1]);
            const dur = parseFloat(match[2]);
            const text = match[3]
                .replace(/&amp;/g, '&')
                .replace(/&quot;/g, '"')
                .replace(/&#39;/g, "'")
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>');

            segments.push({
                id: (idx++).toString(),
                start: start,
                end: start + dur,
                text,
                speaker: "YouTube Captions"
            });
        }

        if (segments.length === 0) {
            throw new Error("Transcript XML parsed successfully but no segments were found.");
        }

        return segments;

    } catch (error: any) {
        console.error("[YouTube] Robust fetch error:", error);
        throw new Error(error.message || "YouTube transcript processing failed.");
    }
}
