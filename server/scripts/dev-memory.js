// run the api with an in-memory db (no mongo install needed)
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { createApp } from '../src/app.js';

const mongod = await MongoMemoryServer.create();
await mongoose.connect(mongod.getUri());
const port = process.env.PORT || 5000;
createApp().listen(port, () => console.log(`API (in-memory DB) listening on port ${port}`));

for (const sig of ['SIGINT', 'SIGTERM']) {
  process.on(sig, async () => {
    await mongoose.disconnect();
    await mongod.stop();
    process.exit(0);
  });
}
