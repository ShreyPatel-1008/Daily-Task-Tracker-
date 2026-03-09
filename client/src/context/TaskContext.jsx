import { createContext, useContext, useState, useCallback } from 'react';
import API from '../utils/api';

const TaskContext = createContext();

export const useTask = () => useContext(TaskContext);

export const TaskProvider = ({ children }) => {
    const [tasks, setTasks] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, pages: 0 });
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);

    const fetchTasks = useCallback(async (params = {}) => {
        setLoading(true);
        try {
            const res = await API.get('/tasks', { params });
            setTasks(res.data.tasks);
            setPagination(res.data.pagination);
            return res.data;
        } catch (err) {
            console.error('Failed to fetch tasks:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const createTask = useCallback(async (taskData) => {
        const res = await API.post('/tasks', taskData);
        setTasks(prev => [res.data.task, ...prev]);
        return res.data.task;
    }, []);

    const updateTask = useCallback(async (id, taskData) => {
        const res = await API.put(`/tasks/${id}`, taskData);
        setTasks(prev => prev.map(t => t._id === id ? res.data.task : t));
        return res.data.task;
    }, []);

    const updateTaskStatus = useCallback(async (id, status) => {
        const res = await API.patch(`/tasks/${id}/status`, { status });
        setTasks(prev => prev.map(t => t._id === id ? res.data.task : t));
        return res.data.task;
    }, []);

    const deleteTask = useCallback(async (id) => {
        await API.delete(`/tasks/${id}`);
        setTasks(prev => prev.filter(t => t._id !== id));
    }, []);

    const fetchCategories = useCallback(async () => {
        try {
            const res = await API.get('/tasks/categories');
            setCategories(res.data.categories);
            return res.data.categories;
        } catch (err) {
            console.error('Failed to fetch categories:', err);
        }
    }, []);

    const startTimer = useCallback(async (taskId) => {
        const res = await API.post(`/tasks/${taskId}/timer/start`);
        if (res.data.task) {
            setTasks(prev => prev.map(t => t._id === taskId ? res.data.task : t));
        }
        return res.data;
    }, []);

    const stopTimer = useCallback(async (taskId) => {
        const res = await API.post(`/tasks/${taskId}/timer/stop`);
        return res.data;
    }, []);

    return (
        <TaskContext.Provider value={{
            tasks, pagination, loading, categories,
            fetchTasks, createTask, updateTask, updateTaskStatus, deleteTask,
            fetchCategories, startTimer, stopTimer
        }}>
            {children}
        </TaskContext.Provider>
    );
};
