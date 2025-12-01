import { useMemo } from 'react';
import { useFirestore } from './useFirestore';

export const useTodos = () => {
    const { 
        data: rawTasks, 
        isLoading, 
        error, 
        addDocument, 
        updateDocument, 
        deleteDocument 
    } = useFirestore('todos');

    // Sort tasks by order field (fallback to createdAt if no order field)
    const tasks = useMemo(() => {
        return [...(rawTasks || [])].sort((a, b) => {
            const orderA = a.order !== undefined ? a.order : Infinity;
            const orderB = b.order !== undefined ? b.order : Infinity;
            if (orderA !== orderB) return orderA - orderB;
            // Fallback to createdAt if order is the same
            return new Date(a.createdAt) - new Date(b.createdAt);
        });
    }, [rawTasks]);

    const addTask = async (text) => {
        if (!text.trim()) return;
        await addDocument({
            text: text.trim(),
            completed: false,
            order: tasks.length,
        });
    };

    const toggleTask = async (id, currentStatus) => {
        await updateDocument(id, { completed: !currentStatus });
    };

    const moveTask = async (id, newParent) => {
        await updateDocument(id, { parent: newParent });
    };

    const removeTask = async (id) => {
        await deleteDocument(id);
    };

    const removeAllTasks = async(id) => {
        if(!tasks || tasks.length === 0){
            return;
        }

        const deletePromises = tasks.map(task => 
            removeTask(task.id)
        );
        await Promise.all(deletePromises);
    }

    const reorderTasks = async (orderedTasks) => {
        for (let i = 0; i < orderedTasks.length; i++) {
            await updateDocument(orderedTasks[i].id, { order: i });
        }
    };

    return { 
        tasks, 
        isLoading, 
        error, 
        addTask, 
        toggleTask, 
        moveTask, 
        removeTask,
        reorderTasks,
        removeAllTasks
    };
};

export const useTodo = useTodos;