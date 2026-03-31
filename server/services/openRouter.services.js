import axios from "axios"


export const askAi = async (messages) => {
    try {
        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            throw new Error("Message Array is empty ")
        }
        const response = await axios.post("https://openrouter.ai/api/v1/chat/completions", {
            model: 'openai/gpt-5.2',
            messages: messages

        }, {
            headers: {
                Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
            },
        }
        )

        const content = response?.data?.choices?.[0]?.messages?.content;
        if(!content || !content.trim()){
            throw new Error("Ai  returned empty response ")
        }
        return content
    } catch (error) {
     console.log(`the error at openrouter.services.js :  ${error}`)
     throw new Error("openrouter api key error");
    }
}