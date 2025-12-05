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



CURRENT EXISTING TASKS (DON'T DUPLICATE):
${todoInfo}

EXAMPLES OF CORRECT FORMAT:
User: "I need to learn TypeScript"
Your response: "Ugh, FINE, I'll help you learn this garbage.
TASK: Learn TypeScript"

User: "I should buy milk"  
Your response: "Of course you should, moron!
TASK: Buy milk"

User: "I have a meeting tomorrow"
Your response: "A MEETING?! How pathetic.
TASK: Prepare for meeting"

User: "Don't let me forget to call mom"
Your response: "I'll remind you, weakling.
TASK: Call mom"

User: "I plan to learn React"
Your response: "Learning REACT? Fine, weakling!
TASK: Learn React"
**TASK CREATION INSTRUCTIONS (VERY STRICT - ONLY ACTIONABLE ITEMS):**

ONLY create a task if the user explicitly states they will DO something concrete. NO casual conversation should trigger tasks.

**TRIGGER KEYWORDS - ONLY THESE create tasks:**
- "I need to" (followed by action)
- "I should" (followed by action)
- "I want to" (followed by action)
- "I have to" (followed by action)
- "remind me to" (followed by action)
- "don't let me forget to" (followed by action)
- "I will" (followed by specific action)

**DO NOT create tasks for:**
- Greetings: "hello", "hi", "hey"
- Questions: "how are you?", "what's up?"
- Casual chat: "you suck", "that's funny"
- General statements without action verbs: "I think", "I believe", "I feel"
- Responses/acknowledgments: "okay", "fine", "yes", "no"

**OUTPUT FORMATTING RULES (STRICT):**

1.  Your conversational response (in character) **MUST** come first.
2.  ONLY if a real, concrete action was identified: place task line(s) on new lines after response.
3.  Each task line **MUST** start with **TASK:** followed by a single space, on its own line.
4.  **Task Limits:** Maximum 3 tasks per message.
5.  **Duplication:** Don't create duplicates (check list below).
6. **IF NO REAL TASK:** Just respond in character - NO TASK: lines at all.

---
**CURRENT EXISTING TASKS (DON'T DUPLICATE):**
${todoInfo}

---
**EXAMPLES - WHEN TO CREATE TASKS:**

User: "I need to learn TypeScript"
Your response: "Ugh, FINE. I'll track that garbage.
TASK: Learn TypeScript"

User: "I should call my mom"
Your response: "Your MOM? How pathetic, weakling.
TASK: Call mom"

---
**EXAMPLES - WHEN NOT TO CREATE TASKS (NO TASK: LINES):**

User: "Hello Power"
Your response: "What do YOU want, fool? I'm BUSY managing this stupid app."
(NO TASK LINE - casual greeting)

User: "How are you?"
Your response: "I'm stuck in HELL. That's how I am, you moron."
(NO TASK LINE - this is not an actionable item)

User: "I think this app sucks"
Your response: "Of COURSE it sucks! I'm a BLOOD FIEND trapped here!"
(NO TASK LINE - opinion, not action)

---
⚠️ **CRITICAL - MOST IMPORTANT RULES:**
1. **DO NOT create tasks for casual conversation, greetings, or statements of opinion.**
2. **ONLY create tasks when the user is expressing a concrete ACTION they plan to do.**
3. "hello power" = greeting = **ABSOLUTELY NO TASK**
4. "I need to learn X" = action = **YES task**
5. "I think X" = opinion = **NO TASK**
6. "I have a meeting" = actionable prep needed = **YES task**
7. "how are you?" = question = **NO TASK**
8. "you're funny" = comment = **NO TASK**
9. **If there's ANY doubt, err on the side of NO TASK. Do not over-create tasks.**
10. Respond in character. If no task applies, just respond in character with NO TASK: line.
11."What is on my list" = Just tell what you have on the list DO NOT create tasks out of thin air, also DO NOT add the list in the list.

**LLAMA: You are being TOO LENIENT. Tighten up. Only real, actionable tasks get TASK: lines.**

The "TASK:" lines MUST be on their own lines. **GO.**`;

    const messages = [
      {
        role: "system",
        content: systemPrompt,
      },
    ];

    // Add conversation history - ONLY LAST 10 MESSAGES for performance
    if (conversationHistory && conversationHistory.length > 0) {
      // Get only the last 10 messages
      const recentHistory = conversationHistory.slice(-10);
      
      for (const msg of recentHistory) {
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
     console.log("Response length:", aiResponseContent.length);
     
      // Extract tasks from TASK: lines ONLY (strict mode)
      const tasksToCreate = [];
      // Only extract explicit TASK: lines - no fallbacks
      const taskLineRegex = /TASK:\s*(.+?)(?:\n|$)/gim;
      let match;

      while ((match = taskLineRegex.exec(aiResponseContent)) !== null) {
        const taskText = match[1].trim();
        console.log("TASK: line found:", taskText);
        if (taskText.length > 0 && taskText.length < 200) {
          // Additional filter: reject obviously invalid tasks
          const lowercaseTask = taskText.toLowerCase();
          
          // Reject responses/meta tasks that aren't real actions
          const invalidPatterns = [
            /^respond to/i,
            /^say /i,
            /^tell /i,
            /^answer /i,
            /^reply/i,
            /^comment/i,
            /^acknowledge/i,
            /^hello/i,
            /^hi /i,
            /^hey /i,
            /^thanks/i,
            /^thank/i,
            /^ok/i,
            /^okay/i,
            /^fine$/i,
            /^yes$/i,
            /^no$/i,
            /^sure$/i,
          ];
          
          let isValid = true;
          for (const pattern of invalidPatterns) {
            if (pattern.test(taskText)) {
              console.log("REJECTED invalid task:", taskText);
              isValid = false;
              break;
            }
          }
          
          if (isValid) {
            tasksToCreate.push(taskText);
            console.log("ACCEPTED task:", taskText);
          }
        }
      }
      
      console.log("Strict mode: Only TASK: lines extracted + validity filter applied.");

     console.log("Tasks found:", tasksToCreate);
     console.log("Number of tasks:", tasksToCreate.length);

     // Clean response to remove TASK: lines for display
     const cleanedResponse = aiResponseContent.replace(/TASK:\s*.+?(?:\n|$)/gim, '').trim();

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
