import { useState, useRef, useLayoutEffect, useEffect } from "react";
import { useTodos } from "@/hooks/useTodo";
import { Plus } from "lucide-react";
import { useTheme } from "next-themes";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import gsap from "gsap";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";

function SortableTask({
  task,
  onDelete,
  onComplete,
  onDeleteWithAnimation,
  taskRefs,
  tasks,
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`flex items-center gap-2 p-3 rounded-lg border focus:outline-none 
    transition-all duration-300 ease-out 
    ${
      isDragging
        ? "border-dashed border-blue-500 bg-blue-50 dark:bg-blue-900 shadow-lg opacity-50"
        : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:shadow-md opacity-100"
    }`}
      tabIndex={0}
    >
      <div
        {...listeners}
        className="flex items-center gap-2 flex-1 cursor-grab active:cursor-grabbing"
      >
        <div
          className={`h-2 w-2 shrink-0 rounded-full transition-colors ${
            task.completed ? "bg-green-500" : "bg-blue-600"
          }`}
        />
        <p
      
      className={`min-w-0 text-wrap wrap-break-words font-medium text-sm transition-colors duration-200 ${
        task.completed
          ? "line-through text-gray-400 dark:text-gray-500"
          : "text-gray-900 dark:text-white"
      }`}
    >
      {task.text}
    </p>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onDeleteWithAnimation(task.id);
        }}
        className="px-3 py-1 rounded text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 font-medium transition-colors"
      >
        Delete
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onComplete(task.id, task.completed);
        }}
        className="px-3 py-1 rounded text-sm text-yellow-600 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 font-medium transition-colors"
      >
        Complete
      </button>
    </div>
  );
}

export function ToDo() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const {
    tasks: remoteTasks,
    addTask,
    removeTask,
    reorderTasks,
    toggleTask,
    removeAllTasks,
  } = useTodos();
  const [localTasks, setLocalTasks] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const taskRefs = useRef({});
  const isFirstRender = useRef(true);
  const isDeleting = useRef(false);
  const isReordering = useRef(false);
  const prevTaskCount = useRef(0);

  // use local tasks during drag, otherwise use remote tasks
  const tasks = localTasks.length > 0 ? localTasks : remoteTasks;

  // sync local tasks when remote tasks change significantly (add/delete)
  useEffect(() => {
    if (localTasks.length > 0 && remoteTasks.length !== localTasks.length) {
      setLocalTasks([]);
    }
  }, [remoteTasks.length, localTasks.length]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleAddTask() {
    if (!inputValue.trim()) return;
    addTask(inputValue);
    setInputValue("");
  }

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      setLocalTasks([]);
      return;
    }

    const oldIndex = tasks.findIndex((t) => t.id === active.id);
    const newIndex = tasks.findIndex((t) => t.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      isReordering.current = true;
      const newTasks = arrayMove(tasks, oldIndex, newIndex);

      // update local state immediately
      setLocalTasks(newTasks);

      // update remote state
      reorderTasks(newTasks).then(() => {
        setLocalTasks([]);
      });
    }
  };

  useLayoutEffect(() => {
    if (isDeleting.current) {
      isDeleting.current = false;
      prevTaskCount.current = tasks.length;
      return;
    }

    if (isReordering.current) {
      isReordering.current = false;
      prevTaskCount.current = tasks.length;
      return;
    }

    // animate all tasks on first render
    if (isFirstRender.current && tasks.length > 0) {
      const allElements = Object.values(taskRefs.current).filter(Boolean);
      if (allElements.length) {
        gsap.from(allElements, {
          opacity: 0,
          y: 100,
          duration: 1,
          stagger: 0.1,
        });
      }
      isFirstRender.current = false;
      prevTaskCount.current = tasks.length;
    }
    // animate only new task when added
    else if (tasks.length > prevTaskCount.current) {
      const lastTask = tasks[tasks.length - 1];
      const lastElement = taskRefs.current[lastTask?.id];
      if (lastElement) {
        gsap.from(lastElement, { opacity: 0, y: 100, duration: 1 });
      }
      prevTaskCount.current = tasks.length;
    }
  }, [tasks.length]);

  const handleGSAPdelete = (taskId) => {
    const element = taskRefs.current[taskId];
    const taskIndex = tasks.findIndex((t) => t.id === taskId);

    if (!element) return; // prevent more than 1 delete

    if (element.dataset.deleting === "true") return;
    element.dataset.deleting = "true"; // get height of elements that are getting deleted

    const elementHeight = element.offsetHeight;
    const gap = 8;

    // a flag to ensure state update happens once all animations are done
    let isCleanupComplete = false;

    // function to run the cleanup and state update
    const performCleanupAndStateUpdate = () => {
      if (isCleanupComplete) return;
      isCleanupComplete = true;

      // use requestAnimationFrame to ensure react state update happens
      // after any remaining visual updates are scheduled.
      requestAnimationFrame(() => {
        isDeleting.current = true;
        removeTask(taskId);
      });
    }; // animate the deleted element

    gsap.to(element, {
      opacity: 0,
      x: -100,
      duration: 0.5,
      ease: "power2.in",
      onComplete: () => {
        gsap.set(element, { display: "none" });

        if (elementsBelowToAnimate.length === 0) {
          performCleanupAndStateUpdate();
        }
      },
    }); // get tasks below the deleted ele

    const tasksBelow = tasks.slice(taskIndex + 1);
    const elementsBelowToAnimate = tasksBelow
      .map((t) => taskRefs.current[t.id])
      .filter(Boolean);

    if (elementsBelowToAnimate.length) {
      gsap.to(elementsBelowToAnimate, {
        y: -(elementHeight + gap),
        duration: 0.5,
        ease: "power2.out",
        onComplete: () => {
          elementsBelowToAnimate.forEach((el) => {
            if (el) gsap.set(el, { clearProps: "y" });
          });

          performCleanupAndStateUpdate();
        },
      });
    }
  };

  return (
    <div className="w-full max-w-md mx-auto mt-10 space-y-6 mb-10">
      <div className="p-4 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Hello!
        </h1>
        <button
          onClick={() => {
            setTheme(resolvedTheme === "light" ? "dark" : "light");
          }}
          className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          {resolvedTheme === "dark" ? "☀️" : "🌙"}
        </button>
      </div>

      <div className="flex gap-2 p-4">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
          placeholder="Enter something..."
          className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:shadow-[0_0_8px_2px_rgba(59,130,246,0.6)] dark:focus:shadow-[0_0_8px_2px_rgba(255,255,255,0.5)] transition-all duration-600 ease-out"
        />
        <button
          onClick={handleAddTask}
          className="px-6 py-2 rounded-lg font-medium transition-all duration-600 ease-out 
           border border-gray-300 dark:border-gray-600 
           
           bg-white dark:bg-gray-800 
           text-black dark:text-white 
           
           hover:shadow-[0_0_8px_2px_rgba(59,130,246,0.6)] 
           dark:hover:shadow-[0_0_8px_2px_rgba(255,255,255,0.5)]
           
           hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <Plus size={16} />
        </button>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          removeAllTasks();
        }}
        className="px-3 py-1 rounded text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 font-medium transition-colors"
      >
        Delete All
      </button>

      <div className="p-4">
        {tasks.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400">
            No tasks yet
          </p>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={tasks.map((t) => t.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    ref={(el) => {
                      if (el) taskRefs.current[task.id] = el;
                    }}
                  >
                    <SortableTask
                      task={task}
                      onDelete={removeTask}
                      onComplete={toggleTask}
                      onDeleteWithAnimation={handleGSAPdelete}
                      taskRefs={taskRefs}
                      tasks={tasks}
                    />
                  </div>
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
}
