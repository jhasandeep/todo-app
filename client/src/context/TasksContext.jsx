import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../api';

const TasksContext = createContext(null);

const byDueDate = (a, b) => new Date(a.dueAt) - new Date(b.dueAt);

export function TasksProvider({ children }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setTasks(await api.listTasks());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const createTask = useCallback(async (data) => {
    const created = await api.createTask(data);
    setTasks((prev) => [...prev, created].sort(byDueDate));
    return created;
  }, []);

  const updateTask = useCallback(async (id, changes) => {
    const updated = await api.updateTask(id, changes);
    setTasks((prev) => prev.map((t) => (t._id === id ? updated : t)).sort(byDueDate));
    return updated;
  }, []);

  const deleteTask = useCallback(async (id) => {
    await api.deleteTask(id);
    setTasks((prev) => prev.filter((t) => t._id !== id));
  }, []);

  // update the UI first, undo if the request fails
  const toggleStatus = useCallback(async (task) => {
    const status = task.status === 'completed' ? 'in_progress' : 'completed';
    setTasks((prev) => prev.map((t) => (t._id === task._id ? { ...t, status } : t)));
    try {
      await api.updateTask(task._id, { status });
    } catch (err) {
      setTasks((prev) => prev.map((t) => (t._id === task._id ? { ...t, status: task.status } : t)));
      setError(err.message);
    }
  }, []);

  const value = useMemo(
    () => ({ tasks, loading, error, setError, reload: load, createTask, updateTask, deleteTask, toggleStatus }),
    [tasks, loading, error, load, createTask, updateTask, deleteTask, toggleStatus]
  );

  return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>;
}

export const useTasks = () => {
  const ctx = useContext(TasksContext);
  if (!ctx) throw new Error('useTasks must be used inside <TasksProvider>');
  return ctx;
};
