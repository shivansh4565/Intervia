import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});
// console.log(await ai.models.list());


const askAi = async (messages) => {
    try {
        const prompt = messages.map(m => m.content).join("\n");

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash", // ✅ FIXED
            contents: prompt,
        });

        const text = response.text;

        if (!text) {
            throw new Error("Empty AI response");
        }

        return text;

    } catch (error) {
        console.error("Gemini FULL Error:", error);
        throw new Error("AI request failed");
    }
};

export default askAi;