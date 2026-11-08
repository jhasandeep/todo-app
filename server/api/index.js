import mongoose from 'mongoose';
import { createApp } from '../src/app.js';

const app = createApp({ clientOrigin: process.env.CLIENT_ORIGIN });

let connecting;
function connect() {
  if (!connecting) {
    connecting = mongoose.connect(process.env.MONGODB_URI).catch((err) => {
      connecting = null;
      console.error('MongoDB connection failed:', err.message);
    });
  }
  return connecting;
}

// queries wait for the connection (mongoose buffers them)
export default function handler(req, res) {
  connect();
  return app(req, res);
}
