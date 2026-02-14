declare module 'youtube-transcript' {
    export class YoutubeTranscript {
        static fetchTranscript(videoIdOrUrl: string, config?: { lang?: string }): Promise<Array<{
            text: string;
            duration: number;
            offset: number;
        }>>;
    }
}
