import { useState, useRef, useLayoutEffect, useEffect } from "react";
import { useTodos } from "@/hooks/useTodo";
import { useAuth } from "@/hooks/useAuth";
import { Plus } from "lucide-react";
import { useTheme } from "next-themes";
import { ThemeTransition } from "./ThemeTransition";
import { MdLightMode } from "react-icons/md";
import { CiLight } from "react-icons/ci";
import { MdDelete } from "react-icons/md";
import { IoIosCheckmarkCircle } from "react-icons/io";
import { MdDeleteForever } from "react-icons/md";
import powerWideImage from "../assets/power2.png";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
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
  isDeleting,
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
    transition-all duration-600 ease-out 
    ${
      isDragging
        ? "border-dashed transition-all duration-600 ease-out border-blue-500 bg-blue-50 dark:bg-blue-900  opacity-50 "
        : "border-gray-600 transition-all duration-600 ease-out dark:border-gray-700 bg-white dark:bg-gray-800 opacity-100"
    }`}
      tabIndex={0}
    >
      <div
        {...listeners}
        className="flex items-center gap-2 flex-1 cursor-grab active:cursor-grabbing min-w-0 transition-all duration-600 ease-out "
      >
        <div
          className={`h-3 w-3 shrink-0 rounded-full transition-all duration-600 ease-out ${
            task.completed ? "bg-green-500" : "bg-blue-600"
          }`}
        />
        <p
          className={`flex-1 min-w-0 break-words font-medium text-sm transition-all duration-600 ease-out ${
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
          if (!isDeleting) {
            onDeleteWithAnimation(task.id);
          }
        }}
        disabled={isDeleting}
        className="px-3 py-1 rounded-full text-sm text-red-600 dark:text-red-400 hover:shadow-[0_0_8px_2px_rgba(239,68,68,0.6)] dark:hover:shadow-[0_0_8px_2px_rgba(239,68,68,0.6)] font-medium transition-all duration-600 ease-out disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <MdDelete size={20} />{" "}
      </button>
      <button
        onClick={(e) => {
          onComplete(task.id, task.completed);
        }}
        className="px-3 py-1 rounded-full text-sm text-green-600 dark:text-green-400 hover:shadow-[0_0_8px_2px_rgba(34,197,94,0.6)]  dark:hover:shadow-[0_0_8px_2px_rgba(34,197,94,0.6)] font-medium transition-all duration-600 ease-out"
      >
        <IoIosCheckmarkCircle size={20} />
      </button>
    </div>
  );
}

export function ToDo() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { isAuthReady } = useAuth();

  const {
    tasks: remoteTasks,
    isLoading,
    addTask,
    removeTask,
    reorderTasks,
    toggleTask,
    removeAllTasks,
  } = useTodos();
  const [localTasks, setLocalTasks] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [deletingTaskId, setDeletingTaskId] = useState(null);
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
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
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

  // Reset isFirstRender when tasks load from Firestore after mount
  useEffect(() => {
    if (!isLoading && tasks.length > 0 && prevTaskCount.current === 0) {
      isFirstRender.current = true;
    }
  }, [isLoading, tasks.length]);

  useLayoutEffect(() => {
    if (isDeleting.current) {
      isDeleting.current = false;
      prevTaskCount.current = tasks.length;
      
      // Clear all transforms after delete completes and React re-renders
      const allElements = Object.values(taskRefs.current).filter(Boolean);
      allElements.forEach((el) => {
        if (el) gsap.set(el, { clearProps: "all" });
      });
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
  }, [tasks]);

  const handleGSAPdelete = (taskId) => {
    // Prevent multiple deletes at once
    if (deletingTaskId) return;
    
    const element = taskRefs.current[taskId];
    const taskIndex = tasks.findIndex((t) => t.id === taskId);

    if (!element) return;

    if (element.dataset.deleting === "true") return;
    element.dataset.deleting = "true";
    
    setDeletingTaskId(taskId);

    const elementHeight = element.offsetHeight;
    const gap = 8;

    // Get tasks below the deleted element
    const tasksBelow = tasks.slice(taskIndex + 1);
    const elementsBelowToAnimate = tasksBelow
      .map((t) => taskRefs.current[t.id])
      .filter(Boolean);

    // Create a timeline for coordinated animations
    const tl = gsap.timeline({
      onComplete: () => {
        // After all animations complete, update state
        isDeleting.current = true;
        removeTask(taskId);
        setDeletingTaskId(null);
      }
    });

    // Animate the deleted element out
    tl.to(element, {
      opacity: 0,
      x: -100,
      duration: 0.5,
      ease: "power2.in",
    });

    // If there are elements below, animate them up simultaneously
    if (elementsBelowToAnimate.length > 0) {
      tl.to(elementsBelowToAnimate, {
        y: -(elementHeight + gap),
        duration: 0.5,
        ease: "power2.out",
      }, 0); // Start at the same time as the deleted element animation (time = 0)
    }
  };

  return (
    <ThemeTransition
      onTransitionStart={() => {
        setTheme(resolvedTheme === "light" ? "dark" : "light");
      }}
    >
      {({ handleThemeChange, buttonRef }) => (
        <div className="w-full max-w-md mx-auto mt-10 space-y-6 mb-10">
          <div className="p-4 flex items-center justify-between">
            <div className="overflow-hidden rounded-xl inline-block">
              <img
                src={powerWideImage}
                className="ml-[-25%] h-18 w-auto scale-x-[-1] object-cover"
              />
            </div>
            <button
              ref={buttonRef}
              onClick={handleThemeChange}
              className="p-2 rounded-lg border border-gray-600 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600  transition-colors"
            >
              {resolvedTheme === "dark" ? <CiLight /> : <MdLightMode />}
            </button>
          </div>

          <div className="flex gap-2 p-4">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
              placeholder="Enter something..."
              className="flex-1 px-4 py-2 rounded-lg border border-gray-600 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:shadow-[0_0_8px_2px_rgba(59,130,246,0.6)] dark:focus:shadow-[0_0_8px_2px_rgba(255,255,255,0.5)] transition-all duration-600 ease-out"
            />
            <button
              onClick={handleAddTask}
              className="px-6 py-2 rounded-lg font-medium transition-all duration-600 ease-out 
               border border-gray-600 dark:border-gray-700 
               
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
            className="px-3 py-2 ml-4 flex rounded text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 font-medium transition-colors"
          >
            <MdDeleteForever className="w-5 h-5" />
            <span>Delete all</span>{" "}
          </button>

          <div className="p-4">
            {(isLoading || !isAuthReady) && tasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 space-y-3">
                <div className="animate-spin">
                  <div className="w-8 h-8 border-4 border-blue-200 dark:border-blue-900 border-t-blue-600 dark:border-t-blue-400 rounded-full"></div>
                </div>
                <p className="text-center text-gray-500 dark:text-gray-400">
                  Loading tasks...
                </p>
              </div>
            ) : tasks.length === 0 ? (
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
                          isDeleting={deletingTaskId !== null}
                        />
                      </div>
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>
        </div>
      )}
    </ThemeTransition>
  );
}
