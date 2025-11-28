
require('dotenv').config(); 
const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 8000;
const { getChatCompletion } = require('./groqClient');

app.use(cors()); 
app.use(express.json());

const chatRoutes = require('./routes/chat');
app.use('/api/chat', chatRoutes); 

app.get('/test-ai-connection', async (req, res) => {
    try {
        const testMessages = [
            { role: "system", content: "You are a straightforward AI assistant. Respond with exactly one sentence." },
            { role: "user", content: "Tell me if the Groq API connection is successful." }
        ];

        const aiResponse = await getChatCompletion(testMessages);

        res.json({ 
            status: "Success!", 
            test_response: aiResponse,
            api_key_loaded: !!process.env.GROQ_API_KEY 
        });

    } catch (error) {
        console.error("Test Error:", error);
        res.status(500).json({ 
            status: "Failure", 
            error: error.message,
            hint: "Check your .env file and Groq API key"
        });
    }
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});