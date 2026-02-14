export interface TranscriptSegment {
    id: string;
    start: number;
    end: number;
    text: string;
    speaker?: string;
}

export interface QuizQuestion {
    id: string;
    question: string;
    options: string[];
    correctAnswer: number; // index
    explanation: string;
    difficulty: 'easy' | 'medium' | 'hard';
}

export interface LectureSummary {
    executiveSummary: string;
    keyTopics: { timestamp: number; topic: string }[];
    takeaways: string[];
    definitions: { term: string; definition: string }[];
}

export interface Lecture {
    id: string;
    title: string;
    date: string;
    duration: number; // seconds
    course: string;
    professor: string;
    transcript: TranscriptSegment[];
    summary: LectureSummary;
    quiz: QuizQuestion[];
    fileUrl?: string; // URL for video/audio playback
    slug?: string; // Short human-readable or random slug for sharing
}
