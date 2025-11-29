const express = require("express");
const router = express.Router();
const { getChatCompletion } = require("../groqClient");

router.post("/", async (req, res) => {
  const { userMessage, conversationHistory } = req.body;

  console.log("\n=== REQUEST RECEIVED ===");
  console.log("User Message Content:", userMessage);
  console.log("Conversation History Length:", conversationHistory?.length);
  if (conversationHistory) {
    console.log("Conversation History Details:");
    conversationHistory.forEach((msg, idx) => {
      console.log(`  [${idx}] ${msg.role}: ${msg.text?.substring(0, 50)}...`);
    });
  }

  if (!userMessage) {
    return res
      .status(400)
      .json({ error: "Missing userMessage ins request body" });
  }

    const messages = [
      {
        role: "system",
        content: "You are a helpful, friendly AI assistant. Answer questions directly and helpfully.",
      },
    ];

    // Add conversation history, excluding the initial greeting and the duplicate user message
    if (conversationHistory && conversationHistory.length > 0) {
      for (const msg of conversationHistory) {
        // Skip if it's the initial AI greeting
        if (msg.role === 'ai' && (msg.text === "Hello" || msg.text.includes("Ask me a question") || msg.text.includes("Chat cleared"))) {
          console.log("Skipping greeting:", msg.text.substring(0, 30));
          continue;
        }
        
        // Skip the current user message (it will be added at the end)
        if (msg.role === 'user' && msg.text === userMessage) {
          console.log("Skipping duplicate user message:", msg.text);
          continue;
        }
        
        // Only include user and ai messages
        if (msg.role === 'user' || msg.role === 'ai') {
          console.log("Adding to history:", msg.role, msg.text.substring(0, 30));
          messages.push({
            role: msg.role === 'ai' ? 'assistant' : 'user',
            content: msg.text
          });
        }
      }
    }

    // Add the current user message
    messages.push({ role: "user", content: userMessage });

   try {
      console.log("Messages being sent to Groq:", JSON.stringify(messages, null, 2));
      const aiResponseContent = await getChatCompletion(messages);
       res.json({ response: aiResponseContent });
    } catch (error) {
      console.error("Chat Error:", error);
      res.status(500).json({ error: "Could not proccess AI request" });
    }
});

module.exports = router;
