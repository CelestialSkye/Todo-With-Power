import { useFirestore } from "./useFirestore";
import { useEffect, useState, useCallback } from "react";
import { useTodos } from "./useTodo";
import { useRecaptcha } from "./useRecaptcha";
import { useRef } from "react";

export const useChat = () => {
  const {
    data: messages,
    isLoading: isDbLoading,
    error: dbError,
    addDocument,
    deleteDocument,
  } = useFirestore("chat_messages");

  const [isApiLoading, setIsApiLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const { tasks: todoList } = useTodos();
  const { executeRecaptchaAction } = useRecaptcha();

  const previousTasksRef = useRef([]);

  const sortedMessages = messages
    ? [...messages].sort((a, b) => {
        return new Date(a.createdAt) - new Date(b.createdAt);
      })
    : [];

  const sendMessage = useCallback(async (userMessage, isProactive = false) => {
    if (!userMessage.trim() || isApiLoading) return;

    const messageText = userMessage.trim();
    setIsApiLoading(true);
    setApiError(null);
    
    if (!isProactive) {
      const userPayload = {
        text: messageText,
        role: "user",
        createdAt: new Date().toISOString(),
      };
      await addDocument(userPayload);
    }

    try {
      // Generate a fresh reCAPTCHA token for each request
      let recaptchaToken = '';
      try {
        recaptchaToken = await executeRecaptchaAction('chat');
      } catch (captchaError) {
        console.warn('reCAPTCHA token generation failed:', captchaError);
        // Continue without token in development, but log the error
      }

       const historyPayload = {
         userMessage: messageText,
         conversationHistory: sortedMessages.map((msg) => ({
           role: msg.role,
           text: msg.text,
         })),
         todoList: todoList || [],
         recaptchaToken,
       };

      const apiUrl = import.meta.env.VITE_API_URL || "https://todo-app-with-ai-box.onrender.com";
      const response = await fetch(`${apiUrl}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(historyPayload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

       const data = await response.json();
       const aiText =
         data.response ||
         "I received an unexpected response from the AI.";

       console.log("=== FRONTEND TASK CREATION DEBUG ===");
       console.log("API response data:", data);
       console.log("tasksToCreate array:", data.tasksToCreate);
       console.log("Current todo list:", todoList);

       // handle auto task creation from AI response
       if (data.tasksToCreate && Array.isArray(data.tasksToCreate) && data.tasksToCreate.length > 0) {
         console.log("Processing tasks, count:", data.tasksToCreate.length);
         for (const taskText of data.tasksToCreate) {
           const trimmedText = String(taskText).trim();
           console.log("Processing task:", trimmedText);
           
           // validation: skip if too short or empty
           if (trimmedText.length < 3) {
             console.log("Skipped: too short");
             continue;
           }
           
           // duplicate prevention
           const taskExists = todoList && todoList.some(
             (t) => t.text.toLowerCase() === trimmedText.toLowerCase()
           );
           
           console.log("Task exists check:", taskExists);
           
           if (!taskExists) {
             try {
               console.log("Creating task:", trimmedText);
               await addTask(trimmedText);
               console.log("Task created successfully!");
             } catch (taskError) {
               console.error("Error creating task:", taskError);
             }
           }
         }
       } else {
         console.log("No tasks to create or invalid format");
       }
       console.log("====================================");

      const aiPayload = {
        text: aiText,
        role: "ai",
        createdAt: new Date().toISOString(),
      };
      await addDocument(aiPayload);
    } catch (error) {
      console.error("API Error:", error);
      setApiError(`AI Error: ${error.message}. Check the console.`);
      const errorPayload = {
        text: `System Error: Failed to get AI response. ${error.message}`,
        role: "system",
        createdAt: new Date().toISOString(),
      };
      await addDocument(errorPayload);
    } finally {
      setIsApiLoading(false);
    }
  }, [isApiLoading, sortedMessages, addDocument]);

  useEffect(() => {
    if (
      !todoList ||
      (todoList.length === 0 && previousTasksRef.current.length === 0)
    ) {
      previousTasksRef.current = todoList || [];
      return;
    }

    const prevTasks = previousTasksRef.current;
    const currentTasks = todoList;
    
    //detect all tasks deleted
    if (currentTasks.length === 0 && prevTasks.length > 0) {
      const totalDeleted = prevTasks.length;
      const proactiveMessage = `The entire list has been purged! All ${totalDeleted} tasks have been removed. The slate is clean.`;
      sendMessage(proactiveMessage, true);
    }
    //detect single task deleted
    else if (currentTasks.length < prevTasks.length) {
      const deletedTask = prevTasks.find(
        (t) => !currentTasks.some((ct) => ct.id === t.id)
      );
      if (deletedTask) {
        const proactiveMessage = `A task was just eliminated from the list: "${deletedTask.text}". Acknowledge the deletion with a short, commanding comment.`;
        sendMessage(proactiveMessage, true);
      }
    }
    //detect task added
    else if (currentTasks.length > prevTasks.length) {
      const newTask = currentTasks.find(
        (t) => !prevTasks.some((pt) => pt.id === t.id)
      );
      if (newTask) {
        const proactiveMessage = `A new task has been added to the list: "${newTask.text}". Please comment on this addition.`;
        sendMessage(proactiveMessage, true);
      }
    }

    previousTasksRef.current = currentTasks;
  }, [todoList, sendMessage]);

  const clearChat = async () => {
    for (const message of sortedMessages) {
      await deleteDocument(message.id);
    }
  };

  const isLoading = isDbLoading || isApiLoading;
  const error = dbError || apiError;

  return {
    messages: sortedMessages,
    isLoading,
    error,
    sendMessage,
    clearChat,
  };
};
