import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const API_KEY = process.env.GOOGLE_AI_API_KEY;

async function listAndTestModels() {
    try {
        console.log("Fetching detailed model list...");
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;
        const response = await fetch(url);
        const data = await response.json();

        if (!data.models) {
            console.log("No models found. Response:", JSON.stringify(data));
            return;
        }

        console.log("--- Available Generation Models ---");
        for (const m of data.models) {
            if (m.supportedGenerationMethods.includes("generateContent")) {
                const name = m.name.replace("models/", "");
                console.log(`Checking ${name}...`);

                try {
                    const testUrl = `https://generativelanguage.googleapis.com/v1beta/${m.name}:generateContent?key=${API_KEY}`;
                    const testRes = await fetch(testUrl, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ contents: [{ parts: [{ text: "hi" }] }] })
                    });

                    if (testRes.ok) {
                        console.log(`[WORKING] ${name}`);
                    } else {
                        const err = await testRes.json();
                        console.log(`[FAILED]  ${name}: ${err.error?.message || "Unknown error"}`);
                    }
                } catch (e) {
                    console.log(`[ERROR]   ${name}: ${e.message}`);
                }
            }
        }
        console.log("--- End of List ---");
    } catch (e) {
        console.error("Fatal Error:", e);
    }
}

listAndTestModels();
