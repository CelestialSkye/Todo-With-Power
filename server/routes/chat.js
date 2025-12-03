const express = require("express");
const router = express.Router();
const { getChatCompletion } = require("../groqClient");

const verifyRecaptcha = async (token) => {
  try {
    const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}`,
    });

    const data = await response.json();
    return data.success && data.score > 0.5;
  } catch (error) {
    console.error("reCAPTCHA verification error:", error);
    return false;
  }
};

router.post("/", async (req, res, next) => {
  try {
    const { userMessage, conversationHistory, todoList, recaptchaToken } = req.body;

    if (!recaptchaToken) {
      return res.status(400).json({ error: "reCAPTCHA token missing" });
    }

    const isValidCaptcha = await verifyRecaptcha(recaptchaToken);
    if (!isValidCaptcha) {
      return res.status(403).json({ error: "reCAPTCHA verification failed" });
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
          continue;
        }

        if (msg.role === "user" && msg.text === userMessage) {
          continue;
        }

        if (msg.role === "user" || msg.role === "ai") {
          messages.push({
            role: msg.role === "ai" ? "assistant" : "user",
            content: msg.text,
          });
        }
      }
    }

    messages.push({ role: "user", content: userMessage });

    const aiResponseContent = await getChatCompletion(messages);
    res.json({ response: aiResponseContent });

  } catch (error) {
    console.error("Chat Error:", error);
    next(error); // Pass to error handling middleware
  }
});

module.exports = router;
