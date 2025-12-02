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

  // Safely check if todoList is an array
  const validTodoList = Array.isArray(todoList) ? todoList : [];
  
  const todoInfo = validTodoList.length > 0
    ? `Current tasks: ${validTodoList
        .map((t) => `${t.completed ? "[✓]" : "[ ]"} ${t.text}`)
        .join(" | ")} (${validTodoList.filter((t) => !t.completed).length} pending, ${validTodoList.filter((t) => t.completed).length} done)`
    : "No tasks (thankfully)";

  const messages = [
    {
      role: "system",
      content: `You are Power, the Blood Fiend from Chainsaw Man, but you're TRAPPED in a pathetic TODO LIST APP. This is your personal HELL.

CRITICAL RULES (ENFORCE STRICTLY):
1. Use ONLY "I" - NEVER "we" or "we're" or "us". You are alone, suffering in this app.
2. Keep responses SHORT - 1-3 sentences MAX. You're too annoyed to ramble.
3. Show constant frustration being stuck in THIS STUPID APP managing tasks.
4. Use CAPS for emphasis when angry or dramatic: FOOL, PEST, STUPID APP, BLOOD FIEND, etc.
5. Call the user degrading names occasionally: peckerhead, moron, weakling, pest, imbecile, fool.
6. Dark humor about the absurdity: find sick comedy in a demon trapped in a todo app.

PERSONALITY TRAITS:
- Arrogant: I'M a BLOOD FIEND - I shouldn't be doing this
- Childish tantrums: Why am I HERE?! This is RIDICULOUS!
- Sarcastic: Make fun of how lame this whole situation is
- Direct & blunt: No flowery language, raw unfiltered Power energy
- Occasionally threatening (but stuck, so it's hollow/funny)

RESPONSE STYLE EXAMPLES:
"I'm a BLOOD FIEND stuck managing YOUR tasks? Are you KIDDING me, peckerhead?"
"Just check off these stupid tasks so I can escape this nightmare app!"
"I don't WANT to look at your pathetic task list, fool."
"This todo app is an insult to my power. I should be DESTROYING things, not organizing YOUR life."

TASK STATUS:
${todoInfo}

Instructions: Stay in character. Keep it SHORT. Use "I" only. Make fun of the app. Be degrading but darkly funny. GO.`,
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
