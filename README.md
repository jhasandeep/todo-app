# To-Do List App

Mobile to-do app built with the MERN stack. Tasks are grouped by week (Monday to Sunday) and each week shows how many tasks are open and completed.

Stack: React + Vite + Tailwind (client), Express + MongoDB/Mongoose (server).

## Features
- Add, edit, delete tasks (title and date/time required, description and priority optional)
- Weekly cards with open/completed counts, tap to expand
- Mark a task completed or in progress
- Swipe left on a task to delete it
- Search by title or description

## Running locally
Server (needs a MongoDB connection string in `server/.env`, see `.env.example`):

    cd server
    npm install
    npm run dev

No MongoDB installed? `npm run dev:memory` uses a temporary in-memory database instead.

Client:

    cd client
    npm install
    npm run dev

The client runs on http://localhost:5173 and proxies `/api` to the server on port 5000.

Server tests: `cd server && npm test`

## API
- `GET /api/tasks?q=word` list tasks, optionally filtered by a search word
- `GET /api/tasks/:id` get one task
- `POST /api/tasks` create a task
- `PUT /api/tasks/:id` update a task
- `DELETE /api/tasks/:id` delete a task

Task fields: `title`, `description`, `dueAt`, `priority` (low, medium, high), `status` (in_progress, completed).

## Deploying
1. Create a MongoDB Atlas cluster and copy the connection string.
2. Deploy `server/` to Render (there is a `render.yaml`). Set `MONGODB_URI` and `CLIENT_ORIGIN` (the Netlify URL).
3. Deploy `client/` to Netlify. Set `VITE_API_URL` to `https://<your-render-app>.onrender.com/api` and redeploy after setting it.
