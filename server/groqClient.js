
const Groq = require('groq-sdk');

const groq = new Groq(); 

const MODEL = 'mixtral-8x7b-32768';
/**
 * Communicates with the groq api
 * @param {Array<Object>} messages - The conversation history and context
 * @returns {Promise<string>} The AI's response text.
 */
async function getChatCompletion(messages) {
    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: messages,
            model: MODEL,
            temperature: 0.8, 
        });

        return chatCompletion.choices[0]?.message?.content || "AI is currently unavailable.";
    } catch (error) {
        console.error("Groq API Error:", error);
        throw new Error("Failed to get response from Groq AI. Check your API key and connection.");
    }
}

module.exports = { getChatCompletion };