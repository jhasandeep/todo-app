import { useCallback, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import TaskSheet from './components/TaskSheet';
import { useTasks } from './context/TasksContext';
import Home from './pages/Home';
import Search from './pages/Search';

export default function App() {
  const { tasks, error, setError } = useTasks();
  const [sheet, setSheet] = useState(null);

  const openAdd = useCallback(() => setSheet({ task: null }), []);
  const openTask = useCallback((task) => setSheet({ task }), []);
  const closeSheet = useCallback(() => setSheet(null), []);

  return (
    <div className="relative mx-auto flex min-h-dvh w-full max-w-md flex-col bg-gray-50 shadow-xl">
      <Routes>
        <Route path="/" element={<Home onAdd={openAdd} onOpenTask={openTask} />} />
        <Route path="/search" element={<Search onOpenTask={openTask} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {sheet && <TaskSheet key={sheet.task?._id ?? 'new'} task={sheet.task} onClose={closeSheet} />}

      {error && tasks.length > 0 && (
        <div
          role="alert"
          className="fixed inset-x-4 bottom-24 z-40 mx-auto flex max-w-sm items-center justify-between gap-3 rounded-xl bg-gray-900 px-4 py-3 text-sm text-white shadow-lg"
        >
          <span>{error}</span>
          <button onClick={() => setError('')} className="font-semibold text-brand-100">
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
}
