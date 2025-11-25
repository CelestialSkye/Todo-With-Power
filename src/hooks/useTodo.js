import { useState, useEffect, useRef } from "react";

export function useTodo() {
  const isFirstRender = useRef(true);

  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem("tasks");
    if (saved) setTasks(JSON.parse(saved));
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
    setTasks(tasks.filter((t) => t.id !== id));
  };

  const moveTask = (id, newParent) => {
    setTasks(
      tasks.map((t) =>
        t.id === id
          ? { ...t, parent: newParent }
          : t
      )
    );
  };

  return { tasks, addTask, removeTask, moveTask };
}
