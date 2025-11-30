const express = require("express");
const router = express.Router();
const { getChatCompletion } = require("../groqClient");

router.post("/", async (req, res) => {
  const { userMessage, conversationHistory, todoList } = req.body;

  console.log("=== DEBUG INFO ===");
  console.log("TodoList received:", JSON.stringify(todoList, null, 2));
  console.log("TodoList is array?", Array.isArray(todoList));
  console.log("TodoList length:", todoList?.length);

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
      content:
        "You are a helpful, friendly AI assistant. Answer questions directly andhelpfully. " +
        (todoList && todoList.length > 0
          ? `The user has a todo list with ${todoList.length} tasks. Pending: ${
              todoList.filter((t) => !t.completed).length
            }, Completed: ${
              todoList.filter((t) => t.completed).length
            }. Tasks: ${todoList
              .map((t) => `${t.completed ? "[✓]" : "[ ]"} ${t.text}`)
              .join(", ")}`
          : "The user has no tasks in their todo list."),
    },
  ];

  // Add conversation history
  if (conversationHistory && conversationHistory.length > 0) {
    for (const msg of conversationHistory) {
      if (
        msg.role === "ai" &&
        (msg.text === "Hello" ||
          msg.text.includes("Ask me a question") ||
          msg.text.includes("Chat cleared"))
      ) {
        console.log("Skipping greeting:", msg.text.substring(0, 30));
        continue;
      }

      if (msg.role === "user" && msg.text === userMessage) {
        console.log("Skipping duplicate user message:", msg.text);
        continue;
      }

      if (msg.role === "user" || msg.role === "ai") {
        console.log("Adding to history:", msg.role, msg.text.substring(0, 30));
        messages.push({
          role: msg.role === "ai" ? "assistant" : "user",
          content: msg.text,
        });
      }
    }
  }

  messages.push({ role: "user", content: userMessage });

  try {
    console.log(
      "Messages being sent to Groq:",
      JSON.stringify(messages, null, 2)
    );
    const aiResponseContent = await getChatCompletion(messages);
    res.json({ response: aiResponseContent });
  } catch (error) {
    console.error("Chat Error:", error);
    res.status(500).json({ error: "Could not proccess AI request" });
  }
});

module.exports = router;
