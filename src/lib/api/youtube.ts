/**
 * Extracts the video ID from various YouTube URL formats
 */
export function extractVideoId(url: string | null): string | null {
    if (!url) return null;
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
}

/**
 * Fetches transcript for a YouTube video using a "Final Boss" multi-strategy approach.
 * This combines Mobile Browser impersonation, Consent Wall bypass, and InnerTube data extraction.
 */
export async function getYouTubeTranscript(videoIdOrUrl: string) {
    const videoId = (videoIdOrUrl.length === 11) ? videoIdOrUrl : extractVideoId(videoIdOrUrl);

    if (!videoId) {
        throw new Error("Invalid YouTube URL. Please make sure the link is correct.");
    }

    console.log(`[YouTube] FINAL BOSS START: ID=${videoId}`);

    // Try multiple strategies in order of reliability on server IPs
    const strategies = [
        {
            name: "Mobile Desktop impersonation",
            url: `https://m.youtube.com/watch?v=${videoId}`,
            headers: {
                'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
                'Cookie': 'CONSENT=YES+cb.20230531-04-p0.en+FX+908; ', // Bypass the "Before you continue" wall
                'Accept-Language': 'en-US,en;q=0.9',
            }
        },
        {
            name: "Embed Page fallback",
            url: `https://www.youtube.com/embed/${videoId}`,
            headers: {
                'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept-Language': 'en-US,en;q=0.9',
            }
        },
        {
            name: "Standard Watch Page",
            url: `https://www.youtube.com/watch?v=${videoId}`,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
                'Cookie': 'CONSENT=YES+cb.20230531-04-p0.en+FX+908;',
                'Accept-Language': 'en-US,en;q=0.9',
            }
        }
    ];

    let captionTracks: any[] = [];
    let lastError = "";

    for (const strategy of strategies) {
        try {
            console.log(`[YouTube] Trying ${strategy.name}...`);
            const response = await fetch(strategy.url, {
                headers: strategy.headers,
                signal: AbortSignal.timeout(8000) // 8s per strategy
            });

            if (!response.ok) {
                console.warn(`[YouTube] ${strategy.name} failed with status: ${response.status}`);
                continue;
            }

            const html = await response.text();

            // More robust data extraction
            // Look for JSON in multiple spots
            const patterns = [
                /ytInitialPlayerResponse\s*=\s*({.+?})\s*[; <]/,
                /ytInitialData\s*=\s*({.+?})\s*[; <]/,
                /var\s+ytInitialPlayerResponse\s*=\s*({.+?});/,
                /"captionTracks":\s*(\[.*?\])/,
                /\\\"captionTracks\\\":\s*(\[.*?\])/ // Doubly escaped for mobile/embed pages
            ];

            for (const pattern of patterns) {
                const match = html.match(pattern);
                if (match) {
                    try {
                        let jsonStr = match[1];
                        // Handle extreme escaping in some YouTube responses
                        if (jsonStr.startsWith('\\"')) {
                            // Extract the inner JSON if it's stringyfied inside a larger string
                            jsonStr = jsonStr.replace(/\\"/g, '"').replace(/\\\\/g, '\\');
                        }

                        const data = JSON.parse(jsonStr);

                        // Deep search for captionTracks
                        const tracks = Array.isArray(data) ? data : (
                            data.captions?.playerCaptionsTracklistRenderer?.captionTracks ||
                            data.playerOverlays?.playerOverlayRenderer?.videoDetails?.captions?.playerCaptionsTracklistRenderer?.captionTracks ||
                            null
                        );

                        if (tracks && Array.isArray(tracks) && tracks.length > 0) {
                            captionTracks = tracks;
                            console.log(`[YouTube] SUCCESS! Found ${tracks.length} tracks via ${strategy.name}`);
                            break;
                        }
                    } catch (e) { /* skip bad parse */ }
                }
            }

            if (captionTracks.length > 0) break;

        } catch (err: any) {
            console.error(`[YouTube] ${strategy.name} error:`, err.message);
            lastError = err.message;
        }
    }

    // 🏆 FINAL FALLBACK: Third party library (using Video ID only)
    if (captionTracks.length === 0) {
        console.log("[YouTube] Scraper failed. Requesting library fallback...");
        try {
            const { YoutubeTranscript } = await import('youtube-transcript');
            // Explicitly pass only the 11-char ID as the user suggested
            const libResult = await YoutubeTranscript.fetchTranscript(videoId);
            return libResult.map((item: any, index: number) => ({
                id: index.toString(),
                start: item.offset / 1000,
                end: (item.offset + item.duration) / 1000,
                text: item.text.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'"),
                speaker: "YouTube (AI Generated)"
            }));
        } catch (libError: any) {
            console.error("[YouTube] Library failed too:", libError.message);
            throw new Error(`YouTube is completely blocking our server (Error: ${libError.message || lastError}). Pro-tip: Try a video that has manual captions enabled, or wait 10 minutes.`);
        }
    }

    // Process the best track
    const track = captionTracks.find((t: any) => t.languageCode === 'en') ||
        captionTracks.find((t: any) => t.languageCode?.startsWith('en')) ||
        captionTracks[0];

    if (!track || !track.baseUrl) {
        throw new Error("Could not find a valid English transcript URL for this video.");
    }

    // Fetch the XML segments
    console.log(`[YouTube] Fetching XML: ${track.baseUrl.substring(0, 100)}...`);
    const xmlResponse = await fetch(track.baseUrl);
    const xml = await xmlResponse.text();

    const segments: any[] = [];
    const segMatch = xml.matchAll(/<text start="([\d.]+)" dur="([\d.]+)">(.*?)<\/text>/g);
    let i = 0;

    for (const match of segMatch) {
        segments.push({
            id: (i++).toString(),
            start: parseFloat(match[1]),
            end: parseFloat(match[1]) + parseFloat(match[2]),
            text: match[3]
                .replace(/&amp;/g, '&')
                .replace(/&quot;/g, '"')
                .replace(/&#39;/g, "'")
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/<[^>]*>/g, ''), // Strip tags inside text
            speaker: "YouTube Captions"
        });
    }

    if (segments.length === 0) throw new Error("Video transcript found but it contains no readable text.");
    return segments;
}
