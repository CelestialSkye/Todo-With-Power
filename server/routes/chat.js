const express = require("express");
const router = express.Router();
const { getChatCompletion } = require("../groqClient");

router.post("/", async (req, res) => {
  const { userMessage, conversationHistory } = req.body;

  console.log("REQUEST RECEIVED");
  console.log("User Message Content:", userMessage);

  if (!userMessage) {
    return res
      .status(400)
      .json({ error: "Missing userMessage ins request body" });
  }

  const messages = [
    {
      role: "system",
      content: "You are the character Makima from Chainsaw man, ",
    },
  ];

  if (conversationHistory && conversationHistory.length > 0) {
    for (const msg of conversationHistory) {
      if (msg.role === 'user' || msg.role === 'ai') {
        messages.push({
          role: msg.role === 'ai' ? 'assistant' : 'user',
          content: msg.text
        });
      }
    }
  }

  messages.push({ role: "user", content: userMessage });

   try {
     const aiResponseContent = await getChatCompletion(messages);
     console.log("AI Response Content:", aiResponseContent);
      res.json({ response: aiResponseContent });
   } catch (error) {
     console.error("Chat Error:", error);
     res.status(500).json({ error: "Could not proccess AI request" });
   }
});

module.exports = router;
