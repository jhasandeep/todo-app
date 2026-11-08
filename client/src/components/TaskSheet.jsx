import { useEffect, useState } from 'react';
import { addHours, format, startOfHour } from 'date-fns';
import { CloseIcon, TrashIcon } from './Icons';
import { useTasks } from '../context/TasksContext';

const INPUT_FORMAT = "yyyy-MM-dd'T'HH:mm";
const PRIORITIES = [
  { value: '', label: 'None' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

const PRIORITY_ACTIVE = {
  '': 'bg-gray-800 text-white',
  low: 'bg-emerald-500 text-white',
  medium: 'bg-amber-500 text-white',
  high: 'bg-red-500 text-white',
};

function initialForm(task) {
  if (task) {
    return {
      title: task.title,
      description: task.description || '',
      dueAt: format(new Date(task.dueAt), INPUT_FORMAT),
      priority: task.priority || '',
      status: task.status,
    };
  }
  return {
    title: '',
    description: '',
    dueAt: format(startOfHour(addHours(new Date(), 1)), INPUT_FORMAT),
    priority: '',
    status: 'in_progress',
  };
}

export default function TaskSheet({ task, onClose }) {
  const { createTask, updateTask, deleteTask } = useTasks();
  const isEdit = Boolean(task);
  const [form, setForm] = useState(() => initialForm(task));
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  const set = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setErrors((errs) => ({ ...errs, [field]: undefined }));
  };

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Title is required';
    if (!form.dueAt || Number.isNaN(new Date(form.dueAt).getTime())) errs.dueAt = 'Date & time is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setBusy(true);
    setSubmitError('');
    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      dueAt: new Date(form.dueAt).toISOString(),
      priority: form.priority || null,
      status: form.status,
    };
    try {
      if (isEdit) await updateTask(task._id, payload);
      else await createTask(payload);
      onClose();
    } catch (err) {
      setSubmitError(err.message);
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!window.confirm('Delete this task?')) return;
    setBusy(true);
    try {
      await deleteTask(task._id);
      onClose();
    } catch (err) {
      setSubmitError(err.message);
      setBusy(false);
    }
  };

  const inputClass = (hasError) =>
    `w-full rounded-xl border bg-white px-3.5 py-3 text-base outline-none transition focus:ring-2 focus:ring-brand-500 ${
      hasError ? 'border-red-400' : 'border-gray-200'
    }`;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" role="dialog" aria-modal="true" aria-label={isEdit ? 'Edit task' : 'Add task'}>
      <div className="animate-fade-in absolute inset-0 bg-black/40" onClick={onClose} />
      <form
        onSubmit={submit}
        noValidate
        className="animate-sheet-in relative max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-2xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">{isEdit ? 'Edit task' : 'New task'}</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-full p-2 text-gray-500 hover:bg-gray-100">
            <CloseIcon />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="title" className="mb-1 block text-sm font-semibold text-gray-700">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              autoFocus={!isEdit}
              value={form.title}
              onChange={set('title')}
              maxLength={120}
              placeholder="What needs to be done?"
              aria-invalid={Boolean(errors.title)}
              className={inputClass(errors.title)}
            />
            {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title}</p>}
          </div>

          <div>
            <label htmlFor="description" className="mb-1 block text-sm font-semibold text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              rows={3}
              value={form.description}
              onChange={set('description')}
              maxLength={1000}
              placeholder="Add some details (optional)"
              className={`${inputClass(false)} resize-none`}
            />
          </div>

          <div>
            <label htmlFor="dueAt" className="mb-1 block text-sm font-semibold text-gray-700">
              Date &amp; time <span className="text-red-500">*</span>
            </label>
            <input
              id="dueAt"
              type="datetime-local"
              value={form.dueAt}
              onChange={set('dueAt')}
              aria-invalid={Boolean(errors.dueAt)}
              className={inputClass(errors.dueAt)}
            />
            {errors.dueAt && <p className="mt-1 text-xs text-red-600">{errors.dueAt}</p>}
          </div>

          <fieldset>
            <legend className="mb-1 block text-sm font-semibold text-gray-700">Priority</legend>
            <div className="grid grid-cols-4 gap-2">
              {PRIORITIES.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  aria-pressed={form.priority === p.value}
                  onClick={() => setForm((f) => ({ ...f, priority: p.value }))}
                  className={`rounded-xl py-2.5 text-sm font-semibold transition ${
                    form.priority === p.value ? PRIORITY_ACTIVE[p.value] : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </fieldset>

          {isEdit && (
            <fieldset>
              <legend className="mb-1 block text-sm font-semibold text-gray-700">Status</legend>
              <div className="grid grid-cols-2 gap-2">
                {[
                  ['in_progress', 'In progress'],
                  ['completed', 'Completed'],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={form.status === value}
                    onClick={() => setForm((f) => ({ ...f, status: value }))}
                    className={`rounded-xl py-2.5 text-sm font-semibold transition ${
                      form.status === value ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </fieldset>
          )}
        </div>

        {submitError && (
          <p role="alert" className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
            {submitError}
          </p>
        )}

        <div className="mt-6 flex gap-3">
          {isEdit && (
            <button
              type="button"
              onClick={remove}
              disabled={busy}
              aria-label="Delete task"
              className="flex items-center justify-center rounded-xl bg-red-50 px-4 text-red-600 disabled:opacity-50"
            >
              <TrashIcon />
            </button>
          )}
          <button
            type="submit"
            disabled={busy}
            className="flex-1 rounded-xl bg-brand-600 py-3.5 text-base font-bold text-white shadow-sm transition hover:bg-brand-700 disabled:opacity-60"
          >
            {busy ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
}
