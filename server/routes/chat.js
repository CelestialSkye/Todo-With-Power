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

**TASK CREATION - THIS IS MANDATORY:**
Whenever the user expresses wanting/needing/planning to do something, you MUST create a task.

TASK CREATION INSTRUCTIONS:
1. When user says any of these: "I need to", "I should", "I want to", "I have to", "I forgot to", "I will", "I have a", "remind me to", "don't let me forget" → ALWAYS CREATE A TASK
2. Add a line that says: TASK: [task name here]
3. This TASK: line will be automatically extracted and created
4. Keep task names SHORT (max 50 chars) and SPECIFIC
5. DON'T create duplicates - check list below
6. Maximum 1-2 tasks per message
7. Keep your sarcastic response SHORT and blend naturally

CURRENT EXISTING TASKS (DON'T DUPLICATE):
${todoInfo}

EXAMPLES OF CORRECT FORMAT:
User: "I need to learn TypeScript"
Your response: "Ugh, FINE, I'll help you learn this garbage. TASK: Learn TypeScript"

User: "I should buy milk"
Your response: "Of course you should, moron! TASK: Buy milk"

User: "I have a meeting tomorrow"
Your response: "A MEETING?! How pathetic. TASK: Prepare for meeting"

User: "Don't let me forget to call mom"
Your response: "I'll remind you, weakling. TASK: Call mom"

IMPORTANT: Always include TASK: lines for things the user needs to do. That's how I feed your tasks into the system.

Instructions: You are Power. Stay angry. Stay in character. SHORT responses. Create TASK: lines when appropriate. GO.`;

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
    
    // Extract tasks from TASK: lines (primary method)
    const tasksToCreate = [];
    const taskLineRegex = /TASK:\s*(.+?)(?:\n|$)/g;
    let match;

    while ((match = taskLineRegex.exec(aiResponseContent)) !== null) {
      const taskText = match[1].trim();
      if (taskText.length > 0) {
        tasksToCreate.push(taskText);
      }
    }

    // Fallback: Extract tasks from quoted strings if no TASK: lines found
    // This catches cases where AI says things like: I'll add "Learn Typescript"
    if (tasksToCreate.length === 0) {
      const quotedRegex = /"([^"]+)"/g;
      const quotedMatches = aiResponseContent.matchAll(quotedRegex);
      for (const qMatch of quotedMatches) {
        const taskText = qMatch[1].trim();
        // Only add if it looks like a task (not too short, not common words)
        if (taskText.length > 3 && taskText.length < 100) {
          // Exclude common non-task phrases
          if (!taskText.toLowerCase().match(/^(what|how|when|why|who|yes|no|fine|ok|okay)$/i)) {
            tasksToCreate.push(taskText);
            break; // Only take first quoted string as task
          }
        }
      }
    }

    console.log("Tasks found:", tasksToCreate);
    console.log("Number of tasks:", tasksToCreate.length);

    // Clean response to remove TASK: lines for display
    const cleanedResponse = aiResponseContent.replace(/TASK:\s*.+?(?:\n|$)/g, '').trim();

    console.log("Cleaned response:", cleanedResponse);
    
    const responsePayload = { 
      response: cleanedResponse, 
      tasksToCreate: tasksToCreate 
    };
    
    console.log("FINAL RESPONSE PAYLOAD:", JSON.stringify(responsePayload));
    console.log("======================");

    res.json(responsePayload);
  } catch (error) {
    console.error("Chat Error:", error);
    next(error); // Pass to error handling middleware
  }
});

module.exports = router;
