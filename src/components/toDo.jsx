import { useState, useRef, useLayoutEffect } from "react";
import { useTodo } from "@/hooks/useTodo";
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
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all ${
        isDragging
          ? "border-dashed border-blue-500 bg-blue-50 dark:bg-blue-900 shadow-lg"
          : "border-transparent hover:border-blue-500 bg-gray-50 dark:bg-gray-700 hover:shadow-md"
      }`}
    >
      <div
        {...listeners}
        className="flex items-center gap-2 flex-1 cursor-grab active:cursor-grabbing"
      >
        <div className="h-2 w-2 shrink-0 rounded-full bg-blue-600" />
        <p className="flex-1 font-medium text-sm text-gray-900 dark:text-white">
          {task.text}
        </p>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDeleteWithAnimation(task.id);
        }}
        className="px-3 py-1 rounded text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 font-medium transition-colors"
      >
        Delete
      </button>
    </div>
  );
}

export function ToDo() {
  const { tasks, addTask, removeTask, reorderTasks } = useTodo();
  const [inputValue, setInputValue] = useState("");
  const taskRefs = useRef({});
  const isFirstRender = useRef(true);
  const isDeleting = useRef(false);
  const prevTaskCount = useRef(0);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      distance: 8,
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

    if (!over || active.id === over.id) return;

    const oldIndex = tasks.findIndex((t) => t.id === active.id);
    const newIndex = tasks.findIndex((t) => t.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const newTasks = arrayMove(tasks, oldIndex, newIndex);
      reorderTasks(newTasks);
    }
  };

  useLayoutEffect(() => {
    // Skip animation when deleting
    if (isDeleting.current) {
      isDeleting.current = false;
      prevTaskCount.current = tasks.length;
      return;
    }

    // Animate all tasks on first render
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
    // Animate only new task when added
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

    if (!element) return;

    // prevent more than 1 delete
    if (element.dataset.deleting === "true") return;
    element.dataset.deleting = "true";

    // get height of elements that are getting deleted
    const elementHeight = element.offsetHeight;
    const gap = 8; 

    // animate the deleted element 
    gsap.to(element, {
      opacity: 0,
      x: -100,
      duration: 0.5,
      ease: "power2.in",
    });

    // get tasks below the deleted ele
    const tasksBelow = tasks.slice(taskIndex + 1);
    const elementsBelowToAnimate = tasksBelow
      .map((t) => taskRefs.current[t.id])
      .filter(Boolean);

    // animate tasks to fill the gap after deletion
    if (elementsBelowToAnimate.length) {
      gsap.to(elementsBelowToAnimate, {
        y: -(elementHeight + gap),
        duration: 0.5,
        ease: "power2.out",
        onComplete: () => {
          // use requestAnimationFrame to ensure clearing happens before React render
          requestAnimationFrame(() => {
            elementsBelowToAnimate.forEach(el => {
              if (el) gsap.set(el, { clearProps: "y" });
            });
            requestAnimationFrame(() => {
              isDeleting.current = true;
              removeTask(taskId);
            });
          });
        },
      });
    } else {
      setTimeout(() => {
        isDeleting.current = true;
        removeTask(taskId);
      }, 500);
    }
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