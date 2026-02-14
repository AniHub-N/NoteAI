import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const API_KEY = process.env.GOOGLE_AI_API_KEY;

async function listModels() {
    try {
        console.log("Fetching models using native fetch...");
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;
        const response = await fetch(url);
        if (!response.ok) {
            console.log(`HTTP Error: ${response.status}`);
            const text = await response.text();
            console.log(text);
            return;
        }
        const data = await response.json();
        console.log("Available Models:");
        if (data.models) {
            data.models.forEach(m => {
                if (m.supportedGenerationMethods && m.supportedGenerationMethods.includes("generateContent")) {
                    console.log(`- ${m.name}`);
                }
            });
        } else {
            console.log("No models field in response:", data);
        }
    } catch (e) {
        console.error("Error:", e);
    }
}

listModels();
