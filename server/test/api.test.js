import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { createApp } from '../src/app.js';

let mongod;
let api;

before(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
  api = request(createApp());
});

after(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

const dueAt = '2025-03-05T10:00:00.000Z';

test('rejects a task without title or date', async () => {
  const noTitle = await api.post('/api/tasks').send({ dueAt });
  assert.equal(noTitle.status, 400);
  assert.match(noTitle.body.message, /Title/);

  const noDate = await api.post('/api/tasks').send({ title: 'x' });
  assert.equal(noDate.status, 400);
  assert.match(noDate.body.message, /Date/);
});

test('rejects an invalid priority', async () => {
  const res = await api.post('/api/tasks').send({ title: 'x', dueAt, priority: 'urgent' });
  assert.equal(res.status, 400);
});

test('create, read, update, complete and delete a task', async () => {
  const created = await api
    .post('/api/tasks')
    .send({ title: '  Buy milk ', description: 'Two litres', dueAt, priority: 'high' });
  assert.equal(created.status, 201);
  assert.equal(created.body.title, 'Buy milk');
  assert.equal(created.body.status, 'in_progress');
  const id = created.body._id;

  const fetched = await api.get(`/api/tasks/${id}`);
  assert.equal(fetched.body.priority, 'high');

  const edited = await api.put(`/api/tasks/${id}`).send({ title: 'Buy oat milk', priority: '' });
  assert.equal(edited.status, 200);
  assert.equal(edited.body.title, 'Buy oat milk');
  assert.equal(edited.body.priority, null);

  const done = await api.put(`/api/tasks/${id}`).send({ status: 'completed' });
  assert.equal(done.body.status, 'completed');

  const removed = await api.delete(`/api/tasks/${id}`);
  assert.equal(removed.status, 200);
  assert.equal((await api.get(`/api/tasks/${id}`)).status, 404);
});

test('search matches title and description, case-insensitively, and escapes regex chars', async () => {
  await api.post('/api/tasks').send({ title: 'Dentist appointment', dueAt });
  await api.post('/api/tasks').send({ title: 'Groceries', description: 'Pick up DENTAL floss', dueAt });
  await api.post('/api/tasks').send({ title: 'Plan (v2) release', dueAt });

  const dent = await api.get('/api/tasks').query({ q: 'dent' });
  assert.deepEqual(dent.body.map((t) => t.title).sort(), ['Dentist appointment', 'Groceries']);

  const dental = await api.get('/api/tasks').query({ q: 'dental' });
  assert.deepEqual(dental.body.map((t) => t.title), ['Groceries']);

  const paren = await api.get('/api/tasks').query({ q: '(v2)' });
  assert.deepEqual(paren.body.map((t) => t.title), ['Plan (v2) release']);
});

test('invalid ids return 400 and unknown ids return 404', async () => {
  assert.equal((await api.get('/api/tasks/not-an-id')).status, 400);
  assert.equal((await api.delete('/api/tasks/64b7f0f0f0f0f0f0f0f0f0f0')).status, 404);
});
