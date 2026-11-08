import express from 'express';
import cors from 'cors';
import tasksRouter from './routes/tasks.js';

export function createApp({ clientOrigin = '*' } = {}) {
  const app = express();

  const origins = clientOrigin.split(',').map((o) => o.trim()).filter(Boolean);
  app.use(cors({ origin: origins.includes('*') ? true : origins }));
  app.use(express.json());

  app.get('/health', (_req, res) => res.json({ status: 'ok' }));
  app.use('/api/tasks', tasksRouter);

  app.use((_req, res) => res.status(404).json({ message: 'Not found' }));

  app.use((err, _req, res, _next) => {
    if (err.name === 'ValidationError') {
      const errors = Object.fromEntries(
        Object.entries(err.errors).map(([field, e]) => [field, e.message])
      );
      return res.status(400).json({ message: Object.values(errors)[0], errors });
    }
    if (err.name === 'CastError') {
      return res.status(400).json({ message: `Invalid value for ${err.path}` });
    }
    if (err.type === 'entity.parse.failed') {
      return res.status(400).json({ message: 'Invalid JSON body' });
    }
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  });

  return app;
}
