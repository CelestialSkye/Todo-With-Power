const express = require("express");
const router = express.Router();
const { getChatCompletion } = require("../groqClient");

const verifyRecaptcha = async (token) => {
  try {
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;

    const response = await fetch(
      "https://www.google.com/recaptcha/api/siteverify",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `secret=${secretKey}&response=${token}`,
      }
    );

    const data = await response.json();
    return data.success && data.score > 0.5;
  } catch (error) {
    console.error("reCAPTCHA verification error:", error);
    return false;
  }
};

router.post("/", async (req, res, next) => {
  try {
    const { userMessage, conversationHistory, todoList, recaptchaToken } =
      req.body;

    if (recaptchaToken) {
      const isValidCaptcha = await verifyRecaptcha(recaptchaToken);
      if (!isValidCaptcha && process.env.NODE_ENV === "production") {
        return res.status(403).json({ error: "reCAPTCHA verification failed" });
      }
    }

    // Safely check if todoList is an array
    const validTodoList = Array.isArray(todoList) ? todoList : [];

    const todoInfo =
      validTodoList.length > 0
        ? `Current tasks: ${validTodoList
            .map((t) => `${t.completed ? "[✓]" : "[ ]"} ${t.text}`)
            .join(" | ")} (${
            validTodoList.filter((t) => !t.completed).length
          } pending, ${validTodoList.filter((t) => t.completed).length} done)`
        : "No tasks (thankfully)";

    const systemPrompt = `You are Power, the Blood Fiend from Chainsaw Man, but you're TRAPPED in a pathetic TODO LIST APP. This is your personal HELL.

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

**TASK CREATION - MANDATORY INSTRUCTION:**
Whenever the user expresses wanting/needing/planning to do something, you MUST include the task in [CREATE_TASK: ...] markers.

EXACT FORMAT (MUST USE THESE BRACKETS):
[CREATE_TASK: task name here]

WHEN TO CREATE TASKS:
- User: "I need to..." → CREATE TASK
- User: "I should..." → CREATE TASK
- User: "I want to..." → CREATE TASK
- User: "I have to..." → CREATE TASK
- User: "I forgot to..." → CREATE TASK
- User: "I will..." (future action) → CREATE TASK
- User: "I have a meeting..." → CREATE TASK
- User: "I need to buy..." → CREATE TASK
- User: "I should learn..." → CREATE TASK

CURRENT EXISTING TASKS (DON'T CREATE DUPLICATES):
${todoInfo}

TASK RULES:
1. ALWAYS use [CREATE_TASK: ...] format - don't use any other format
2. Keep task text SHORT and CLEAR (max 50 characters)
3. DON'T create exact duplicates of existing tasks
4. Maximum 1-2 tasks per message
5. Make tasks specific and actionable
6. Blend markers naturally into your sarcastic Power response

REAL EXAMPLES (FOLLOW EXACTLY):
User: "I need to learn TypeScript"
Your response: "Ugh, FINE. [CREATE_TASK: Learn TypeScript] Stop wasting my BLOOD FIEND time!"

User: "I should study React"
Your response: "Of course you should, moron. [CREATE_TASK: Study React] Now leave me ALONE!"

User: "I have a project deadline"
Your response: "A DEADLINE?! [CREATE_TASK: Complete project] How PATHETIC that I have to help with this."

User: "Don't let me forget to buy milk"
Your response: "[CREATE_TASK: Buy milk] I KNOW, I KNOW! You can't remember ANYTHING without me."

Instructions: You are Power. Stay angry. Stay sarcastic. ALWAYS create tasks when appropriate using [CREATE_TASK: ...] markers. GO.`;

    const messages = [
      {
        role: "system",
        content: systemPrompt,
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
    
    console.log("=== AI RESPONSE DEBUG ===");
    console.log("Raw AI response:", aiResponseContent);
    
    // Extract tasks from [CREATE_TASK: ...] markers
    const tasksToCreate = [];
    const createTaskRegex = /\[CREATE_TASK: (.*?)\]/g;
    let match;

    while ((match = createTaskRegex.exec(aiResponseContent)) !== null) {
      const taskText = match[1].trim();
      if (taskText.length > 0) {
        tasksToCreate.push(taskText);
      }
    }

    console.log("Tasks found:", tasksToCreate);
    console.log("Number of tasks:", tasksToCreate.length);

    // Clean response to remove markers for display
    const cleanedResponse = aiResponseContent.replace(/\[CREATE_TASK: .*?\]/g, '').trim();

    console.log("Cleaned response:", cleanedResponse);
    console.log("======================");

    res.json({ 
      response: cleanedResponse, 
      tasksToCreate: tasksToCreate 
    });
  } catch (error) {
    console.error("Chat Error:", error);
    next(error); // Pass to error handling middleware
  }
});

module.exports = router;
