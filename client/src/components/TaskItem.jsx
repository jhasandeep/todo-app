import { useRef, useState } from 'react';
import { format } from 'date-fns';
import { CheckIcon, ClockIcon, EditIcon, TrashIcon } from './Icons';
import { useTasks } from '../context/TasksContext';
import { isCompleted } from '../utils/weeks';

const ACTION_WIDTH = 88;
const OPEN_THRESHOLD = 44;
const DRAG_START = 8;

const PRIORITY_STYLES = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-amber-100 text-amber-700',
  low: 'bg-emerald-100 text-emerald-700',
};

export function PriorityBadge({ priority }) {
  if (!priority) return null;
  return (
    <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize ${PRIORITY_STYLES[priority]}`}>
      {priority}
    </span>
  );
}

export default function TaskItem({ task, onOpen, showActions = false }) {
  const { toggleStatus, deleteTask, setError } = useTasks();
  const [offset, setOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const drag = useRef({ active: false, captured: false, startX: 0, startY: 0, base: 0, moved: false });
  const done = isCompleted(task);
  const closed = offset === 0 && !dragging;

  const remove = async () => {
    try {
      await deleteTask(task._id);
    } catch (err) {
      setOffset(0);
      setError(err.message);
    }
  };

  const onPointerDown = (e) => {
    if (e.target.closest('[data-no-swipe]')) return;
    drag.current = { active: true, captured: false, startX: e.clientX, startY: e.clientY, base: offset, moved: false };
  };

  const onPointerMove = (e) => {
    const d = drag.current;
    if (!d.active) return;
    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;
    if (!d.captured) {
      if (Math.abs(dy) > DRAG_START && Math.abs(dy) > Math.abs(dx)) {
        d.active = false;
        return;
      }
      if (Math.abs(dx) < DRAG_START) return;
      // capture only after a real horizontal drag so taps still work
      d.captured = true;
      e.currentTarget.setPointerCapture(e.pointerId);
      setDragging(true);
    }
    d.moved = true;
    setOffset(Math.min(0, Math.max(-ACTION_WIDTH, d.base + dx)));
  };

  const endDrag = () => {
    const d = drag.current;
    if (!d.active) return;
    d.active = false;
    setDragging(false);
    if (d.captured) setOffset((o) => (o < -OPEN_THRESHOLD ? -ACTION_WIDTH : 0));
  };

  const onClick = () => {
    if (drag.current.moved) {
      drag.current.moved = false;
      return;
    }
    if (offset !== 0) setOffset(0);
    else onOpen(task);
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onOpen(task);
    } else if (e.key === 'Delete') {
      remove();
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl">
      <button
        type="button"
        onClick={remove}
        aria-label={`Delete ${task.title}`}
        className={`absolute inset-y-0 right-0 flex flex-col items-center justify-center gap-1 bg-red-500 text-xs font-semibold text-white transition-[visibility] duration-200 ${
          closed ? 'invisible' : ''
        }`}
        style={{ width: ACTION_WIDTH }}
      >
        <TrashIcon size={18} />
        Delete
      </button>

      <div
        onClick={onClick}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        className={`group relative flex w-full cursor-pointer select-none items-start gap-3 border border-gray-100 bg-white p-3.5 text-left shadow-sm ${
          dragging ? '' : 'transition-transform duration-200'
        }`}
        style={{ transform: `translateX(${offset}px)`, touchAction: 'pan-y' }}
      >
        <div className="flex flex-col items-center gap-2">
        <button
          type="button"
          data-no-swipe
          onClick={(e) => {
            e.stopPropagation();
            toggleStatus(task);
          }}
          aria-pressed={done}
          aria-label={done ? 'Mark as in progress' : 'Mark as completed'}
          className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
            done ? 'border-brand-600 bg-brand-600 text-white' : 'border-gray-300 text-transparent hover:border-brand-500'
          }`}
        >
          <CheckIcon size={14} />
        </button>
        {!showActions && (
          <button
            type="button"
            data-no-swipe
            onClick={(e) => {
              e.stopPropagation();
              remove();
            }}
            aria-label={`Remove ${task.title}`}
            className="hidden rounded-md p-0.5 text-gray-400 opacity-0 transition hover:text-red-600 focus-visible:opacity-100 group-hover:opacity-100 md:block"
          >
            <TrashIcon size={16} />
          </button>
        )}
        </div>

        <div className="min-w-0 flex-1">
          <div
            role="button"
            tabIndex={0}
            onKeyDown={onKeyDown}
            aria-label={`Open ${task.title}`}
            className="rounded-md outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            <div className="flex items-start justify-between gap-2">
              <p className={`break-words font-semibold ${done ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                {task.title}
              </p>
              <PriorityBadge priority={task.priority} />
            </div>
            {task.description && (
              <p className={`mt-0.5 line-clamp-2 text-sm ${done ? 'text-gray-400' : 'text-gray-500'}`}>
                {task.description}
              </p>
            )}
            <div className="mt-2 flex items-center justify-between gap-2">
              <p className="flex items-center gap-1 text-xs text-gray-500">
                <ClockIcon size={13} />
                {format(new Date(task.dueAt), 'EEE, MMM d · h:mm a')}
              </p>
              <span
                className={`text-[11px] font-medium ${done ? 'text-emerald-600' : 'text-brand-600'}`}
              >
                {done ? 'Completed' : 'In progress'}
              </span>
            </div>
          </div>

          {showActions && (
            <div data-no-swipe className="mt-3 flex gap-2 border-t border-gray-100 pt-3">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpen(task);
                }}
                className="flex items-center gap-1.5 rounded-lg bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700"
              >
                <EditIcon size={14} /> View / Edit
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  remove();
                }}
                className="flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600"
              >
                <TrashIcon size={14} /> Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
