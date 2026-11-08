import { startOfWeek, endOfWeek, format, isSameYear } from 'date-fns';

// weeks start on monday
const WEEK_OPTIONS = { weekStartsOn: 1 };

export const isCompleted = (task) => task.status === 'completed';

export function weekRangeLabel(start, end) {
  const startFmt = isSameYear(start, end) ? 'MMM d' : 'MMM d, yyyy';
  return `${format(start, startFmt)} - ${format(end, 'MMM d, yyyy')}`;
}

export function groupByWeek(tasks) {
  const map = new Map();
  for (const task of tasks) {
    const start = startOfWeek(new Date(task.dueAt), WEEK_OPTIONS);
    const key = start.getTime();
    if (!map.has(key)) {
      const end = endOfWeek(start, WEEK_OPTIONS);
      map.set(key, { key, start, end, label: weekRangeLabel(start, end), tasks: [], open: 0, completed: 0 });
    }
    const week = map.get(key);
    week.tasks.push(task);
    if (isCompleted(task)) week.completed += 1;
    else week.open += 1;
  }
  const weeks = [...map.values()].sort((a, b) => a.key - b.key);
  for (const week of weeks) week.tasks.sort((a, b) => new Date(a.dueAt) - new Date(b.dueAt));
  return weeks;
}

export const currentWeekKey = () => startOfWeek(new Date(), WEEK_OPTIONS).getTime();
