import 'dotenv/config';
import mongoose from 'mongoose';
import { createApp } from './app.js';

const { MONGODB_URI, PORT = 5000, CLIENT_ORIGIN = '*' } = process.env;

if (!MONGODB_URI) {
  console.error('MONGODB_URI is not set. Copy .env.example to .env and fill it in.');
  process.exit(1);
}

await mongoose.connect(MONGODB_URI);
console.log('MongoDB connected');

createApp({ clientOrigin: CLIENT_ORIGIN }).listen(PORT, () => {
  console.log(`API listening on port ${PORT}`);
});
