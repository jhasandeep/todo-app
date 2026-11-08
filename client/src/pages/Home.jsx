import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusIcon, SearchIcon } from '../components/Icons';
import WeekCard from '../components/WeekCard';
import { useTasks } from '../context/TasksContext';
import { currentWeekKey, groupByWeek } from '../utils/weeks';

const gridClass = 'grid items-start gap-4 md:grid-cols-2 xl:grid-cols-3';

export default function Home({ onAdd, onOpenTask }) {
  const { tasks, loading, error, reload } = useTasks();
  const weeks = useMemo(() => groupByWeek(tasks), [tasks]);
  const thisWeek = currentWeekKey();
  const [toggled, setToggled] = useState({});

  const isExpanded = (key) => toggled[key] ?? key === thisWeek;
  const toggle = (key) => setToggled((t) => ({ ...t, [key]: !isExpanded(key) }));

  return (
    <>
      <header className="sticky top-0 z-10 bg-gray-50/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 pb-3 pt-[max(1.25rem,env(safe-area-inset-top))] sm:px-6 lg:px-8">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">My Tasks</h1>
            <p className="text-sm text-gray-500">Your week at a glance</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onAdd}
              className="hidden items-center gap-2 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-brand-700 md:flex"
            >
              <PlusIcon size={18} /> Add Task
            </button>
            <Link
              to="/search"
              aria-label="Search tasks"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-gray-700 shadow-sm ring-1 ring-gray-100 transition hover:text-brand-600"
            >
              <SearchIcon />
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-28 pt-2 sm:px-6 md:pb-10 lg:px-8">
        {loading && (
          <div className={gridClass} aria-busy="true" aria-label="Loading tasks">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-36 animate-pulse rounded-3xl bg-gray-200" />
            ))}
          </div>
        )}

        {!loading && error && weeks.length === 0 && (
          <div className="mx-auto max-w-md rounded-2xl bg-red-50 p-4 text-center text-sm text-red-700">
            <p>{error}</p>
            <button onClick={reload} className="mt-3 rounded-lg bg-red-600 px-4 py-2 font-semibold text-white">
              Try again
            </button>
          </div>
        )}

        {!loading && !error && weeks.length === 0 && (
          <div className="mt-16 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-brand-600">
              <PlusIcon size={28} />
            </div>
            <h2 className="text-lg font-bold">No tasks yet</h2>
            <p className="mt-1 text-sm text-gray-500">Tap "Add Task" to plan your first week.</p>
          </div>
        )}

        <div className={gridClass}>
          {weeks.map((week) => (
            <WeekCard
              key={week.key}
              week={week}
              isCurrent={week.key === thisWeek}
              expanded={isExpanded(week.key)}
              onToggle={() => toggle(week.key)}
              onOpenTask={onOpenTask}
            />
          ))}
        </div>

        {!loading && weeks.length > 0 && (
          <p className="pt-6 text-center text-xs text-gray-400">Swipe a task left to delete it</p>
        )}
      </main>

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-20 flex justify-center pb-[max(1.25rem,env(safe-area-inset-bottom))] md:hidden">
        <button
          onClick={onAdd}
          className="pointer-events-auto flex items-center gap-2 rounded-full bg-brand-600 px-6 py-3.5 text-base font-bold text-white shadow-lg shadow-brand-600/30 transition hover:bg-brand-700 active:scale-95"
        >
          <PlusIcon size={20} /> Add Task
        </button>
      </div>
    </>
  );
}
