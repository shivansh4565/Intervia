import { GoogleGenerativeAI } from "@google/generative-ai";

const apikey = "AIzaSyDf5W3bVkHtMo7Pm7bfxGHcoS9uQeBvsDY "

const genAI = new GoogleGenerativeAI(apikey);
// console.log("KEY LOADED:", process.env.GEMINI_API_KEY?.slice(0, 10), "...");

const askAi = async (messages) => {
    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-3-flash-preview", // 🔥 use stable model
        });

        const prompt = messages.map(m => m.content).join("\n");

        const result = await model.generateContent(prompt);
        const response = await result.response;

        const text = response.text();

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