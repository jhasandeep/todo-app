import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { ArrowLeftIcon, CloseIcon, SearchIcon } from '../components/Icons';
import TaskItem from '../components/TaskItem';
import { useTasks } from '../context/TasksContext';

export default function Search({ onOpenTask }) {
  const { tasks } = useTasks();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const term = query.trim();

  useEffect(() => {
    if (!term) {
      setResults([]);
      setError('');
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const found = await api.listTasks(term);
        if (!cancelled) {
          setResults(found);
          setError('');
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [term, tasks]);

  const live = new Map(tasks.map((t) => [t._id, t]));
  const visible = results.filter((t) => live.has(t._id)).map((t) => live.get(t._id));

  return (
    <>
      <header className="sticky top-0 z-10 bg-gray-50/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-3xl items-center gap-3 px-4 pb-3 pt-[max(1.25rem,env(safe-area-inset-top))] sm:px-6">
        <Link
          to="/"
          aria-label="Back"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-gray-700 shadow-sm ring-1 ring-gray-100"
        >
          <ArrowLeftIcon />
        </Link>
        <div className="relative flex-1">
          <SearchIcon size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            autoFocus
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title or description"
            aria-label="Search tasks"
            className="h-11 w-full rounded-full border border-gray-200 bg-white pl-10 pr-10 text-base outline-none focus:ring-2 focus:ring-brand-500 [&::-webkit-search-cancel-button]:hidden"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-gray-400 hover:text-gray-600"
            >
              <CloseIcon size={16} />
            </button>
          )}
        </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 space-y-3 px-4 pb-10 pt-2 sm:px-6" aria-live="polite">
        {!term && <p className="mt-16 text-center text-sm text-gray-500">Type a keyword to find your tasks.</p>}
        {term && loading && visible.length === 0 && <p className="mt-16 text-center text-sm text-gray-500">Searching...</p>}
        {term && error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        {term && !loading && !error && visible.length === 0 && (
          <p className="mt-16 text-center text-sm text-gray-500">No tasks match "{term}".</p>
        )}
        {term && visible.length > 0 && (
          <p className="text-xs font-medium text-gray-500">
            {visible.length} result{visible.length === 1 ? '' : 's'}
          </p>
        )}
        {term &&
          visible.map((task) => <TaskItem key={task._id} task={task} onOpen={onOpenTask} showActions />)}
      </main>
    </>
  );
}
