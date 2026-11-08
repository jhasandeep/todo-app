import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import tasksRouter from './routes/tasks.js';

let connecting;
function connect(uri) {
  if (!connecting) {
    connecting = mongoose.connect(uri).catch((err) => {
      connecting = null;
      console.error('MongoDB connection failed:', err.message);
    });
  }
  return connecting;
}

export function createApp({ clientOrigin = '*', mongoUri } = {}) {
  const app = express();

  // used on Vercel, where there is no server start-up step to connect the db
  if (mongoUri) {
    app.use((_req, _res, next) => {
      connect(mongoUri);
      next();
    });
  }

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

// default export is what Vercel looks for
export default createApp({
  clientOrigin: process.env.CLIENT_ORIGIN,
  mongoUri: process.env.MONGODB_URI,
});
