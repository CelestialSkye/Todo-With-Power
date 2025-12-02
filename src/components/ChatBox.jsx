import { useRef, useEffect, useState } from "react";
import { User, MessageSquare, X, Trash2 } from "lucide-react";
import { useChat } from "../hooks/useChat";
import { BsFillSendFill } from "react-icons/bs";
import powerImage from "../assets/power.jpg";

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
      ? "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 self-end rounded-br-none ml-auto border border-gray-600 dark:border-gray-600"
      : isSystem
      ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border border-red-300 dark:border-red-700 rounded-bl-none"
      : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 self-start rounded-bl-none mr-auto border border-gray-600 dark:border-gray-600";

    const iconColor = isUser
      ? "text-black dark:text-white"
      : isSystem
      ? "text-red-500"
      : "text-gray-500";

    return (
      <div
        className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}
      >
        <div
          className={`${baseClasses} ${messageClasses} ${
            isUser ? "flex-row-reverse" : "flex-row"
          }`}
         >
           {isUser ? (
             <User className={`w-5 h-5 flex-shrink-0 ${iconColor}`} />
           ) : isSystem ? (
             <div className={`w-5 h-5 flex-shrink-0 rounded-full ${iconColor}`} />
           ) : (
             <img src={powerImage} alt="AI" className="w-5 h-5 flex-shrink-0 rounded-md object-cover" />
           )}
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
        <div className="w-full h-full flex flex-col rounded-xl shadow-2xl overflow-hidden border border-gray-600 dark:bg-gray-800 dark:border-gray-700 transition-colors duration-600">
          <header className="bg-gray-100 dark:bg-gray-800 rounded-t-[11px] border-b border-gray-600 dark:border-gray-600 p-3 text-black dark:text-white text-lg font-semibold flex items-center justify-between shadow-md transition-colors duration-600">
            <h1 className="flex items-center space-x-2">
              <img src={powerImage} className="h-8 w-8 rounded-md" />{" "}
              <span className="text-black dark:text-white">Power</span>
            </h1>
            <div className="flex items-center space-x-1">
              <button
                onClick={clearChat}
                className="p-1 rounded-full hover:shadow-[0_0_8px_2px_rgba(59,130,246,0.6)] 
               dark:hover:shadow-[0_0_8px_2px_rgba(255,255,255,0.5)] transition-all duration-600 ease-out"
                title="Clear chat history"
              >
                <Trash2 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-full hover:shadow-[0_0_8px_2px_rgba(239,68,68,0.6)] dark:hover:shadow-[0_0_8px_2px_rgba(239,68,68,0.6)] transition-all duration-600 ease-out"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white dark:bg-gray-800 transition-colors duration-600">
            {messages.length === 0 ? (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-gray-800 p-3 my-2 rounded-xl shadow-md rounded-bl-none text-gray-500 dark:text-gray-300 border border-gray-600 dark:border-gray-600 transition-colors duration-600">
                  No messages yet. Start a conversation!
                </div>
              </div>
            ) : (
              messages.map((msg) => <Message key={msg.id} message={msg} />)
            )}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-gray-700 p-3 my-2 rounded-xl shadow-md rounded-bl-none flex items-center space-x-2 border border-gray-600 dark:border-gray-600 transition-colors duration-600">
                  <img src={powerImage} className="h-10 w-10 rounded-md" />
                  <span className="text-sm white-black  dark:text-gray-300">
                    Power is typing...
                  </span>
                </div>
              </div>
            )}

            {error && (
              <div className="flex justify-start">
                <div className="bg-red-100 dark:bg-red-900/30 p-3 my-2 rounded-xl shadow-md rounded-bl-none text-red-800 dark:text-red-300 border border-red-300 dark:border-red-700 transition-colors duration-600">
                  Error: {error}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <form
            onSubmit={handleSendMessage}
            className="p-3 bg-white dark:bg-gray-800 border-t border-gray-600 dark:border-gray-700 transition-colors duration-600"
          >
            <div className="flex space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  isLoading ? "Waiting for response..." : "Ask power anything"
                }
                disabled={isLoading}
                className="flex-1 p-2 border border-gray-600 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded-lg focus:ring-1 focus:ring-gray-500 focus:border-gray-500 transition duration-150 shadow-inner text-sm disabled:bg-gray-100 dark:disabled:bg-gray-600"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="px-4 py-0 bg-white dark:bg-gray-800 border border-gray-600 dark:border-gray-700 text-gray-800 dark:text-gray-400 rounded-lg shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:bg-white dark:disabled:bg-gray-800 disabled:text-gray-400 dark:disabled:text-gray-600 transition duration-150 flex items-center justify-center text-sm font-medium"
              >
                <BsFillSendFill className="h-4 w-4 text-gray-800 dark:text-white" />
              </button>
            </div>
          </form>
        </div>
      </div>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 border border-black dark:border-gray-600 right-6 p-4 bg-white dark:bg-gray-800 text-white rounded-full shadow-2xl hover:shadow-[0_0_8px_2px_rgba(59,130,246,0.6)] 
               dark:hover:shadow-[0_0_8px_2px_rgba(255,255,255,0.5)] transition-all ease-out duration-600 transform hover:scale-105 z-50 focus:outline-none focus:ring-4 "
      >
        {isOpen ? (
          <X className="w-6 h-6 text-black dark:text-white" />
        ) : (
          <MessageSquare className="w-6 h-6 text-black dark:text-white" />
        )}
      </button>
    </div>
  );
};

export default ChatBox;
