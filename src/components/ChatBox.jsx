import { useRef, useEffect, useState } from "react";
import { Send, Cpu, User, MessageSquare, X, Trash2 } from "lucide-react";
import { useChat } from "../hooks/useChat";

const ChatBox = () => {
  const { messages, isLoading, error, sendMessage, clearChat } = useChat();
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(true);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    await sendMessage(input);
    setInput("");
  };

  const Message = ({ message }) => {
    const isUser = message.role === "user";
    const isSystem = message.role === "system";

    const baseClasses =
      "max-w-[85%] p-3 my-2 rounded-xl shadow-md flex items-start space-x-3";

    const messageClasses = isUser
      ? "bg-indigo-500 text-white self-end rounded-br-none ml-auto"
      : isSystem
      ? "bg-red-100 text-red-800 border border-red-300 rounded-bl-none"
      : "bg-white text-gray-800 self-start rounded-bl-none mr-auto border border-gray-200";

    const IconComponent = isUser ? User : Cpu;
    const iconColor = isUser
      ? "text-indigo-200"
      : isSystem
      ? "text-red-500"
      : "text-indigo-500";

    return (
      <div
        className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}
      >
        <div
          className={`${baseClasses} ${messageClasses} ${
            isUser ? "flex-row-reverse" : "flex-row"
          }`}
        >
          <IconComponent className={`w-5 h-5 flex-shrink-0 ${iconColor}`} />
          <p className="whitespace-pre-wrap leading-relaxed">{message.text}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="relative w-full h-auto bg-transparent">
      <div
        className={`
                    fixed bottom-24 right-6 z-50 
                    ${
                      isOpen
                        ? "opacity-100 translate-y-0 pointer-events-auto"
                        : "opacity-0 translate-y-4 pointer-events-none"
                    }
                    transition-all duration-300 ease-in-out
                    w-80 h-112 sm:w-96 sm:h-128
                    max-w-[90vw]
                `}
      >
        <div className="w-full h-full flex flex-col bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-100">
           <header className="bg-indigo-600 p-3 text-white text-lg font-semibold flex items-center justify-between shadow-md">
             <h1 className="flex items-center space-x-2">
               <Cpu className="w-5 h-5" />
               <span>Ai</span>
             </h1>
             <div className="flex items-center space-x-1">
               <button
                 onClick={clearChat}
                 className="p-1 rounded-full hover:bg-indigo-500 transition"
                 title="Clear chat history"
               >
                 <Trash2 className="w-5 h-5" />
               </button>
               <button
                 onClick={() => setIsOpen(false)}
                 className="p-1 rounded-full hover:bg-indigo-500 transition"
               >
                 <X className="w-5 h-5" />
               </button>
             </div>
           </header>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.length === 0 ? (
              <div className="flex justify-start">
                <div className="bg-white p-3 my-2 rounded-xl shadow-md rounded-bl-none text-gray-500 border border-gray-200">
                  No messages yet. Start a conversation!
                </div>
              </div>
            ) : (
              messages.map((msg) => (
                <Message key={msg.id} message={msg} />
              ))
            )}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white p-3 my-2 rounded-xl shadow-md rounded-bl-none flex items-center space-x-2 border border-gray-200">
                  <Cpu className="w-5 h-5 text-indigo-500 animate-pulse" />
                  <span className="text-sm text-gray-600">AI is typing...</span>
                </div>
              </div>
            )}

            {error && (
              <div className="flex justify-start">
                <div className="bg-red-100 p-3 my-2 rounded-xl shadow-md rounded-bl-none text-red-800 border border-red-300">
                  Error: {error}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <form
            onSubmit={handleSendMessage}
            className="p-3 bg-white border-t border-gray-200"
          >
            <div className="flex space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  isLoading ? "Waiting for response..." : "Ask me a question..."
                }
                disabled={isLoading}
                className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 shadow-inner text-sm disabled:bg-gray-100"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-indigo-300 transition duration-150 flex items-center justify-center text-sm font-medium"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </div>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 p-4 bg-indigo-600 text-white rounded-full shadow-2xl hover:bg-indigo-700 transition duration-300 transform hover:scale-105 z-50 focus:outline-none focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-50"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <MessageSquare className="w-6 h-6" />
        )}
      </button>
    </div>
  );
};

export default ChatBox;
