import { useState, useEffect, useRef } from "react";

export function useTodo() {
  const isFirstRender = useRef(true);

  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem("tasks");
    if (saved) {
      const parsedTasks = JSON.parse(saved);
      const tasksWithIds = parsedTasks.map((task) => {
        if (typeof task === "string") {
          return {
            id: crypto.randomUUID(),
            text: task,
            parent: "Planned",
          };
        }
        if (!task.id) {
          return {
            ...task,
            id: crypto.randomUUID(),
          };
        }
        return task;
      });
      setTasks(tasksWithIds);
    }
  }, []);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  const addTask = (text) => {
    if (!text.trim()) return;

    const newTask = {
      id: crypto.randomUUID(),
      text,
      parent: "Planned",
    };

    setTasks([...tasks, newTask]);
  };

  const removeTask = (id) => {
    const updated = tasks.filter((t) => t.id !== id);
    setTasks(updated);
  };

  const moveTask = (id, newParent) => {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, parent: newParent } : t)));
  };

  const reorderTasks = (newTasks) => {
    setTasks(newTasks);
    
  };

  return { tasks, addTask, removeTask, moveTask, reorderTasks };
}
