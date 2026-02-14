import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || "");

export interface LectureSummaryResult {
  title?: string;
  executiveSummary: string;
  keyTopics: Array<{ timestamp: number; topic: string }>;
  takeaways: string[];
  definitions: Array<{ term: string; definition: string }>;
}

export async function generateTitle(
  transcript: string
): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `Based on the following lecture transcript, generate a concise, descriptive, and academic title for the lecture (max 10 words).
    
Transcript:
${transcript.substring(0, 10000)} // Limit input for title

Return ONLY the title text, no quotes, no markdown.`;

    const result = await model.generateContent(prompt);
    return result.response.text().trim().replace(/^"|"$/g, '');
  } catch (error) {
    console.error("Gemini title generation error:", error);
    return "Untitled Lecture";
  }
}

export async function generateSummary(
  transcript: string
): Promise<LectureSummaryResult> {
  try {
    if (!process.env.GOOGLE_AI_API_KEY) {
      throw new Error("GOOGLE_AI_API_KEY is not set in environment variables");
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `You are an expert at analyzing lecture transcripts and creating comprehensive study guides.

Analyze the following lecture transcript and provide a structured summary in JSON format.

Transcript:
${transcript}

Return ONLY valid JSON in this exact format:
{
  "executiveSummary": "A 2-3 sentence overview of the lecture",
  "keyTopics": [
    {"timestamp": 0, "topic": "Topic name"},
    {"timestamp": 120, "topic": "Another topic"}
  ],
  "takeaways": [
    "Key takeaway 1",
    "Key takeaway 2",
    "Key takeaway 3"
  ],
  "definitions": [
    {"term": "Term", "definition": "Definition"},
    {"term": "Another term", "definition": "Its definition"}
  ]
}

Important: Return ONLY the JSON object, no markdown formatting, no explanations.`;

    console.log("Calling Gemini API for summarization...");
    const result = await model.generateContent(prompt);
    const response = result.response.text();
    console.log("Gemini response received, length:", response.length);

    // Clean up response - more robust JSON extraction
    let cleanedResponse = response.trim();

    // Attempt to find the first '{' and last '}'
    const firstBrace = cleanedResponse.indexOf('{');
    const lastBrace = cleanedResponse.lastIndexOf('}');

    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      cleanedResponse = cleanedResponse.substring(firstBrace, lastBrace + 1);
    } else {
      // Fallback to older cleanup if braces not found (unlikely for objects)
      cleanedResponse = cleanedResponse
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
    }

    console.log("Parsing JSON response...");
    const summary = JSON.parse(cleanedResponse);

    // Also generate a title
    const title = await generateTitle(transcript);

    return {
      ...summary,
      title,
    };
  } catch (error) {
    console.error("Gemini summarization error:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    throw new Error(`Summarization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
}

export async function generateQuiz(
  transcript: string,
  summary: LectureSummaryResult
): Promise<QuizQuestion[]> {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const prompt = `You are an expert at creating educational quiz questions.

Based on this lecture summary, create 5 multiple-choice quiz questions.

Summary:
${summary.executiveSummary}

Key Topics:
${summary.keyTopics.map(t => t.topic).join(", ")}

Return ONLY valid JSON in this exact format:
[
  {
    "id": "1",
    "question": "Question text?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "explanation": "Why this answer is correct",
    "difficulty": "easy"
  }
]

Mix difficulty levels (2 easy, 2 medium, 1 hard).
Return ONLY the JSON array, no markdown formatting.`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();

    let cleanedResponse = response.trim();

    // Attempt to find the first '[' and last ']'
    const firstBracket = cleanedResponse.indexOf('[');
    const lastBracket = cleanedResponse.lastIndexOf(']');

    if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
      cleanedResponse = cleanedResponse.substring(firstBracket, lastBracket + 1);
    } else {
      cleanedResponse = cleanedResponse
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
    }

    const questions = JSON.parse(cleanedResponse);
    return questions;
  } catch (error) {
    console.error("Gemini quiz generation error:", error);
    throw new Error(`Quiz generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
