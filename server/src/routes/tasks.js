import { Router } from 'express';
import mongoose from 'mongoose';
import Task from '../models/Task.js';

const router = Router();

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// only allow these fields from the request body
const pickWritable = (body = {}) => {
  const out = {};
  for (const key of ['title', 'description', 'dueAt', 'priority', 'status']) {
    if (body[key] !== undefined) out[key] = body[key];
  }
  // empty string from the form = no priority
  if (out.priority === '') out.priority = null;
  return out;
};

const validateId = (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: 'Invalid task id' });
  }
  next();
};

// GET /api/tasks?q=keyword
router.get('/', async (req, res, next) => {
  try {
    const filter = {};
    const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
    if (q) {
      const rx = new RegExp(escapeRegex(q), 'i');
      filter.$or = [{ title: rx }, { description: rx }];
    }
    const tasks = await Task.find(filter).sort({ dueAt: 1, createdAt: 1 });
    res.json(tasks);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', validateId, async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const task = await Task.create(pickWritable(req.body));
    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', validateId, async (req, res, next) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, pickWritable(req.body), {
      new: true,
      runValidators: true,
    });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', validateId, async (req, res, next) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json({ message: 'Task deleted', id: task.id });
  } catch (err) {
    next(err);
  }
});

export default router;
