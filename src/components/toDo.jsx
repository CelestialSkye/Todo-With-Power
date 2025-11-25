import { useState } from "react";
import { useTodo } from "@/hooks/useTodo";

export function ToDo() {
  const { tasks, addTask, removeTask } = useTodo();
  const [inputValue, setInputValue] = useState("");
  const [draggedIndex, setDraggedIndex] = useState(null);

  function handleAddTask() {
    if (!inputValue.trim()) return;
    addTask(inputValue);
    setInputValue("");
  }

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) return;

    const newTasks = [...tasks];
    const draggedItem = newTasks[draggedIndex];
    newTasks.splice(draggedIndex, 1);
    newTasks.splice(targetIndex, 0, draggedItem);

    localStorage.setItem("tasks", JSON.stringify(newTasks));

    setDraggedIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <div className="w-full max-w-md mx-auto mt-10 space-y-6">
      <div className="p-4 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Hello!
        </h1>
        <button
          onClick={() => {
            const html = document.documentElement;
            if (html.classList.contains("dark")) {
              html.classList.remove("dark");
              localStorage.setItem("theme", "light");
            } else {
              html.classList.add("dark");
              localStorage.setItem("theme", "dark");
            }
          }}
          className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          🌙
        </button>
      </div>

      <div className="flex gap-2 p-4">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
          placeholder="Enter something..."
          className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleAddTask}
          className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
        >
          Add
        </button>
      </div>

      <div className="p-4 space-y-2">
        {tasks.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400">
            No tasks yet
          </p>
        ) : (
          tasks.map((task, index) => (
            <div
              key={index}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              className={`flex items-center gap-2 p-3 rounded-lg border-2 cursor-move transition-all ${
                draggedIndex === index
                  ? "opacity-50 border-dashed border-blue-500 bg-blue-50 dark:bg-blue-900"
                  : "border-transparent hover:border-blue-500 bg-gray-50 dark:bg-gray-700"
              }`}
            >
              <div className="h-2 w-2 shrink-0 rounded-full bg-blue-600" />
              <p className="flex-1 font-medium text-sm text-gray-900 dark:text-white">
                {task}
              </p>
              <button
                onClick={() => removeTask(index)}
                className="px-3 py-1 rounded text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 font-medium transition-colors"
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
