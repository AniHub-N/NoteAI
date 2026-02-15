/**
 * Extracts the video ID from various YouTube URL formats
 */
export function extractVideoId(url: string): string | null {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
}

/**
 * Fetches transcript for a YouTube video using an ultra-resilient multi-stage approach.
 * This is designed to bypass Vercel/Server IP blocks.
 */
export async function getYouTubeTranscript(videoIdOrUrl: string) {
    const videoId = videoIdOrUrl.length === 11 ? videoIdOrUrl : extractVideoId(videoIdOrUrl);

    if (!videoId) {
        throw new Error("Invalid YouTube URL or Video ID");
    }

    // List of strategies to try to find the transcript metadata
    const strategies = [
        {
            name: "YouTube Embed Page",
            url: `https://www.youtube.com/embed/${videoId}`,
            headers: {
                'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Cache-Control': 'no-cache',
            }
        },
        {
            name: "Standard Watch Page",
            url: `https://www.youtube.com/watch?v=${videoId}`,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
                'Accept-Language': 'en-US,en;q=0.9',
            }
        },
        {
            name: "Mobile Desktop Mode",
            url: `https://m.youtube.com/watch?v=${videoId}`,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
            }
        }
    ];

    let captionTracks: any[] = [];
    let lastError = "";

    console.log(`[YouTube] Emergency Fetch Initiated: ${videoId}`);

    for (const strategy of strategies) {
        try {
            console.log(`[YouTube] Attempting Strategy: ${strategy.name}`);
            const response = await fetch(strategy.url, {
                headers: strategy.headers,
                signal: AbortSignal.timeout(10000) // 10s timeout per attempt
            });

            if (!response.ok) {
                console.warn(`[YouTube] ${strategy.name} failed with status: ${response.status}`);
                continue;
            }

            const html = await response.text();

            // Check for bot blocks or generic consent walls
            if (html.includes("consent.youtube.com") || html.includes("robot") || html.includes("Verify you're a human")) {
                console.warn(`[YouTube] ${strategy.name} was blocked by a bot wall.`);
                continue;
            }

            // Extract using multiple JSON and Regex patterns
            const dataPatterns = [
                /ytInitialPlayerResponse\s*=\s*({.+?})\s*[; <]/,
                /ytInitialData\s*=\s*({.+?})\s*[; <]/,
                /"captionTracks":\s*(\[.*?\])/,
                /captionTracks\\":\s*(\[.*?\])/ // Escaped version
            ];

            for (const pattern of dataPatterns) {
                const match = html.match(pattern);
                if (match) {
                    try {
                        let jsonStr = match[1];
                        // Handle potential escaping in some watch page versions
                        if (jsonStr.includes('\\"')) {
                            jsonStr = jsonStr.replace(/\\"/g, '"').replace(/\\\\/g, '\\');
                        }

                        const data = JSON.parse(jsonStr);

                        // Drill down to where captionTracks usually live
                        const tracks = Array.isArray(data) ? data : (
                            data.captions?.playerCaptionsTracklistRenderer?.captionTracks ||
                            data.playerOverlays?.playerOverlayRenderer?.videoDetails?.captions?.playerCaptionsTracklistRenderer?.captionTracks ||
                            null
                        );

                        if (tracks && Array.isArray(tracks) && tracks.length > 0) {
                            captionTracks = tracks;
                            console.log(`[YouTube] Success! Found ${tracks.length} tracks via ${strategy.name}`);
                            break;
                        }
                    } catch (e) { /* silent parse fail */ }
                }
            }

            if (captionTracks.length > 0) break;

        } catch (err: any) {
            console.error(`[YouTube] ${strategy.name} threw error:`, err.message);
            lastError = err.message;
        }
    }

    // 🏆 LAST RESORT: Try the dedicated library
    if (captionTracks.length === 0) {
        console.log("[YouTube] Native scraping failed. Triggering Library Fallback...");
        try {
            const { YoutubeTranscript } = await import('youtube-transcript');
            const libResult = await YoutubeTranscript.fetchTranscript(videoId);
            return libResult.map((item: any, index: number) => ({
                id: index.toString(),
                start: item.offset / 1000,
                end: (item.offset + item.duration) / 1000,
                text: item.text.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'"),
                speaker: "YouTube Captions"
            }));
        } catch (libError: any) {
            console.error("[YouTube] All methods (including library) failed.");
            throw new Error(`YouTube is completely blocking our server. Please try again in 5 minutes or use a different video. (Detail: ${libError.message || lastError})`);
        }
    }

    // Process the best available track (English preferred)
    const bestTrack = captionTracks.find((t: any) => t.languageCode === 'en') ||
        captionTracks.find((t: any) => t.languageCode?.startsWith('en')) ||
        captionTracks[0];

    if (!bestTrack || !bestTrack.baseUrl) {
        throw new Error("This video exists but doesn't have an English transcript available for us to read.");
    }

    // Fetch the actual XML transcript data
    console.log(`[YouTube] Fetching XML from: ${bestTrack.baseUrl}`);
    const xmlRes = await fetch(bestTrack.baseUrl);
    if (!xmlRes.ok) throw new Error("Could not download the transcript file from YouTube storage.");

    const xml = await xmlRes.text();
    const result: any[] = [];
    const regex = /<text start="([\d.]+)" dur="([\d.]+)">(.*?)<\/text>/g;
    let match;
    let i = 0;

    while ((match = regex.exec(xml)) !== null) {
        const text = match[3]
            .replace(/&amp;/g, '&')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/<[^>]*>/g, ''); // Strip any internal HTML tags

        result.push({
            id: (i++).toString(),
            start: parseFloat(match[1]),
            end: parseFloat(match[1]) + parseFloat(match[2]),
            text: text.trim(),
            speaker: "YouTube Captions"
        });
    }

    if (result.length === 0) throw new Error("Transcript was found but it contains no readable text segments.");

    return result;
}
