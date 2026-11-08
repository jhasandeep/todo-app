import { useId } from 'react';
import { ChevronDownIcon } from './Icons';
import TaskItem from './TaskItem';

export default function WeekCard({ week, isCurrent, expanded, onToggle, onOpenTask }) {
  const panelId = useId();
  const total = week.open + week.completed;
  const percent = total ? Math.round((week.completed / total) * 100) : 0;

  return (
    <section className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-gray-100">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        aria-controls={panelId}
        className="block w-full p-4 text-left outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-500"
      >
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-gray-900">{week.label}</h2>
            {isCurrent && (
              <span className="mt-1 inline-block rounded-full bg-brand-100 px-2 py-0.5 text-[11px] font-semibold text-brand-700">
                This week
              </span>
            )}
          </div>
          <ChevronDownIcon
            className={`shrink-0 text-gray-400 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
          />
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-amber-50 px-3 py-2">
            <p className="text-2xl font-bold leading-none text-amber-600">{week.open}</p>
            <p className="mt-1 text-xs font-medium text-amber-700">Open tasks</p>
          </div>
          <div className="rounded-2xl bg-emerald-50 px-3 py-2">
            <p className="text-2xl font-bold leading-none text-emerald-600">{week.completed}</p>
            <p className="mt-1 text-xs font-medium text-emerald-700">Completed</p>
          </div>
        </div>

        <div
          className="mt-3 h-1.5 overflow-hidden rounded-full bg-gray-100"
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Weekly progress"
        >
          <div className="h-full rounded-full bg-emerald-500 transition-all duration-300" style={{ width: `${percent}%` }} />
        </div>
      </button>

      <div id={panelId} hidden={!expanded}>
        <div className="space-y-2.5 border-t border-gray-100 bg-gray-50/70 p-3">
          {week.tasks.map((task) => (
            <TaskItem key={task._id} task={task} onOpen={onOpenTask} />
          ))}
        </div>
      </div>
    </section>
  );
}
