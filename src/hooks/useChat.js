import { useFirestore } from "./useFirestore";
import { useState } from "react";

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

  const sortedMessages = messages
    ? [...messages].sort((a, b) => {
        return new Date(a.createdAt) - new Date(b.createdAt);
      })
    : [];

  const sendMessage = async (userMessage) => {
    if (!userMessage.trim() || isApiLoading) return;

    const messageText = userMessage.trim();
    setIsApiLoading(true);
    setApiError(null);

    const userPayload = {
      text: messageText,
      role: "user",
      createdAt: new Date().toISOString(),
    };
    await addDocument(userPayload);

    try {
      const historyPayload = {
        userMessage: messageText,
        conversationHistory: sortedMessages.map((msg) => ({
          role: msg.role,
          text: msg.text,
        })),
      };

      const response = await fetch("http://localhost:8000/api/chat", {
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
