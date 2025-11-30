import { useFirestore } from "./useFirestore";
import { useEffect, useState } from "react";
import { useTodos } from "./useTodo";
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

  const previousTasksRef = useRef([]);

  const sortedMessages = messages
    ? [...messages].sort((a, b) => {
        return new Date(a.createdAt) - new Date(b.createdAt);
      })
    : [];

  const sendMessage = async (userMessage, isProactive = false) => {
    console.log("sendMessage called with:", userMessage);
    console.log("todoList:", todoList);

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
      const historyPayload = {
        userMessage: messageText,
        conversationHistory: sortedMessages.map((msg) => ({
          role: msg.role,
          text: msg.text,
        })),
        todoList: todoList,
      };

      console.log("Sending payload:", historyPayload);

      const response = await fetch("http://localhost:8000/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(historyPayload),
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      const aiText =
        data.response || "I received an unexpected response from the AI.";

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
  };

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
    //detect task added
    if (currentTasks.length > prevTasks.length) {
      const newTask = currentTasks.find(
        (t) => !prevTasks.some((pt) => pt.id === t.id)
      );
      if (newTask) {
        const proactiveMessage = `A new task has been added to the list: "${newTask.text}". Please comment on this addition.`;
        sendMessage(proactiveMessage ,true);
      }
    }

    //detect task deleted
    if (currentTasks.length < prevTasks.length) {
      const deletedTask = prevTasks.find(
        (t) => !currentTasks.some((ct) => ct.id === t.id)
      );
      if (deletedTask) {
        const proactiveMessage = `A task was just eliminated from the list: "${deletedTask.text}". Acknowledge the deletion with a short, commanding comment.`;
        sendMessage(proactiveMessage ,true);
      }
    }

    previousTasksRef.current = currentTasks;
  }, [todoList]);

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
