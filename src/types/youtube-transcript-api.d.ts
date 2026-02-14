declare module 'youtube-transcript-api' {
    export class TranscriptClient {
        static getTranscript(videoId: string, config?: { lang?: string }): Promise<Array<{
            text: string;
            duration: number;
            offset: number;
            lang?: string;
        }>>;
    }
}
