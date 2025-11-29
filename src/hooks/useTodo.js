import { useFirestore } from './useFirestore';

export const useTodos = () => {
    const { 
        data: tasks, 
        isLoading, 
        error, 
        addDocument, 
        updateDocument, 
        deleteDocument 
    } = useFirestore('todos');

    const addTask = async (text) => {
        if (!text.trim()) return;
        await addDocument({
            text: text.trim(),
            completed: false,
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
        reorderTasks
    };
};

export const useTodo = useTodos;