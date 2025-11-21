import { useState } from "react";

export function useTodo() {
  const [tasks, setTasks] = useState([]);

  const addTask = (task) => {
    if (!task || task.trim() === "") {
      return;
    }

    const newTasks = [...tasks, task];

    setTasks(newTasks);
  };

const removeTask = function(index) {
  const newTasks = [];

  for (let i = 0; i < tasks.length; i++) {
    if (i !== index) {
      newTasks.push(tasks[i]);
    }
  }

  setTasks(newTasks);
};


  return {
    tasks,
    addTask,
    removeTask,
  };
}
