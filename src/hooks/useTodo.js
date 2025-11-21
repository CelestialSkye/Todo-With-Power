import { useState, useEffect, useRef } from "react";

export function useTodo() {
  const isFirstRender = useRef(true);

  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const savedTasks = localStorage.getItem("tasks");

    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));     }
  }, []);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false; 
      return; 
    }

    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  const addTask = (task) => {
    if (!task || task.trim() === "") return; 

    setTasks([...tasks, task]); 
  };

  const removeTask = (index) => {
    const updatedTasks = tasks.filter((_, i) => i !== index);
    setTasks(updatedTasks);
  };

  return { tasks, addTask, removeTask };
}
