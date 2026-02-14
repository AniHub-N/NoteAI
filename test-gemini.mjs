import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || "");

async function run() {
    try {
        console.log("Fetching model list...");
        // In the newer SDKs, listModels might not be available directly on the model or genAI 
        // without a specific import or it might be different. 
        // Let's just try to test the most common ones and print success/fail clearly.
        const models = [
            "gemini-1.5-flash",
            "gemini-1.5-pro",
            "gemini-pro",
            "gemini-1.0-pro"
        ];

        for (const m of models) {
            try {
                const model = genAI.getGenerativeModel({ model: m });
                const result = await model.generateContent("Hi");
                console.log(`[SUCCESS] Model: ${m}`);
            } catch (e) {
                console.log(`[FAIL]    Model: ${m} - Error: ${e.message}`);
            }
        }
    } catch (error) {
        console.error("General error:", error);
    }
}

run();
