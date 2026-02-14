import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const API_KEY = process.env.GOOGLE_AI_API_KEY;

async function listModels() {
    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;
        const response = await fetch(url);
        const data = await response.json();
        if (data.models) {
            console.log("VALID_MODELS_START");
            data.models.forEach(m => {
                const name = m.name.replace("models/", "");
                console.log(name);
            });
            console.log("VALID_MODELS_END");
        }
    } catch (e) {
        console.error("Error:", e);
    }
}

listModels();
