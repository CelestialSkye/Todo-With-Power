# Debug Instructions for Task Creation

## Step 1: Start the dev servers

Terminal 1 - Frontend:
```bash
cd /Users/sameerodeh/my-project
npm run dev
```

Terminal 2 - Backend:
```bash
cd /Users/sameerodeh/my-project/server
npm start
```

## Step 2: Open Browser DevTools

1. Open your app in browser (usually http://localhost:5173)
2. Press F12 to open DevTools
3. Click on "Console" tab

## Step 3: Test Task Creation

Send a message to Power like:
- "I need to learn TypeScript"
- "I have a meeting tomorrow"
- "I should study React"

## Step 4: Check the Logs

You should see debug output in:

**Backend Console (Terminal 2):**
```
=== AI RESPONSE DEBUG ===
Raw AI response: Ugh, FINE. [CREATE_TASK: Learn TypeScript] Stop bothering me...
Tasks found: ['Learn TypeScript']
Number of tasks: 1
Cleaned response: Ugh, FINE. Stop bothering me...
======================
```

**Browser Console (F12):**
```
=== FRONTEND TASK CREATION DEBUG ===
API response data: {response: "...", tasksToCreate: ['Learn TypeScript']}
tasksToCreate array: ['Learn TypeScript']
Current todo list: [...]
Processing tasks, count: 1
Processing task: Learn TypeScript
Task exists check: false
Creating task: Learn TypeScript
Task created successfully!
====================================
```

## Step 5: What to Look For

1. **Is AI generating [CREATE_TASK: ...]?** - Check backend console
2. **Is backend parsing correctly?** - Should show tasks in "Tasks found"
3. **Is frontend receiving data?** - Check browser console
4. **Is duplicate check passing?** - Should show "false" for new tasks
5. **Did addTask() run?** - Look for "Task created successfully!"

## Common Issues:

❌ **"No tasks to create or invalid format"**
- AI isn't using the markers, or response format is wrong

❌ **"Skipped: too short"**
- Task name is less than 3 characters

❌ **"Task exists check: true"**
- Duplicate task detected (frontend filter)

❌ **No console output at all**
- Dev server might not have reloaded, try Ctrl+Shift+R to hard refresh
