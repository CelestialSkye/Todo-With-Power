const Groq = require('groq-sdk');

console.log("GROQ_API_KEY loaded:", !!process.env.GROQ_API_KEY);
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
}); 

const MODEL = 'llama-3.1-8b-instant';

async function getChatCompletion(messages) {
    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: messages,
            model: MODEL,
            temperature: 0.8, 
        });

        return chatCompletion.choices[0]?.message?.content || "AI is currently unavailable.";
    } catch (error) {
        console.error("Groq API Error:", error.message);
        console.error("Error details:", error);
        throw error;
    }
}

module.exports = { getChatCompletion };