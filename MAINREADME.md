# PrepX Real-Time Exam Timer

## Prerequisites
- Node.js 20.19+ or 22.12+
- npm 10+

## Project Structure
- `server/`: Node.js + Express + Socket.IO (TypeScript)
- `client/`: React + Vite (TypeScript)

## Setup
```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

## Run (development)
```bash
# Terminal 1 - backend (port 4000)
cd server
npm run dev

# Terminal 2 - frontend (Vite dev server)
cd client
npm run dev
# Open the printed URL (e.g., http://localhost:5173)
```

## Production build (optional)
```bash
cd server && npm run build
cd ../client && npm run build
```

## Login (static for test)
- Admin: `admin` / `admin123`
- Student: `student` / `student123`

## Usage Flow
1. Login as admin or student.
2. Pick an exam from the list.
3. Admin can Start, Pause, Reset, and Adjust time (minutes). Students see the synchronized timer.
4. Admin logout or closing the page resets the current exam timer.

## API (backend)
Base URL: `http://localhost:4000`

- `POST /auth/login` → `{ username, password }` → `{ ok, token, user }`
- `GET /me` (Bearer token) → `{ ok, user }`
- `GET /exams` → `{ ok, exams }`
- `GET /exams/:examId` → `{ ok, exam }`
- `GET /exams/:examId/timer` → current timer state for exam
- `POST /exams/:examId/timer/start` (admin) → `{ durationMs? }`
- `POST /exams/:examId/timer/pause` (admin)
- `POST /exams/:examId/timer/reset` (admin) → `{ durationMs? }`
- `POST /exams/:examId/timer/adjust` (admin) → `{ deltaMs, userId? }`

Timer state payload includes:
```json
{
  "examId": "exam-1",
  "running": true,
  "durationMs": 3600000,
  "startedAtMs": 1737310000000,
  "pausedRemainingMs": 3590000,
  "globalDeltaMs": 0,
  "perUserDeltaMs": { "student-1": 60000 },
  "serverNowMs": 1737310050000,
  "remainingMs": 3550000
}
```

## Real-time (Socket.IO)
- Connects to `/socket.io` (proxied via Vite).
- Client emits `join_exam` with `{ examId, userId? }`.
- Server broadcasts `timer_state` (full state) and `timer_finished`.
- Clients filter events by `examId` to avoid cross-exam leakage.

## Technical Choices
- TypeScript end-to-end for safety.
- In-memory `TimerService` per `examId` using server time as the source of truth.
  - Computes remaining time from `startedAtMs`, `durationMs`, and deltas.
  - `globalDeltaMs` (all users) and `perUserDeltaMs` (display-only per user) support.
  - Ticks every 1s to broadcast state, emitting immediately on changes.
- Socket.IO rooms (`exam:${examId}`) to isolate real-time updates per exam.
- React + Vite for a fast DX; simple styling without external UI libs.
- Vite dev proxy to backend for REST and WebSocket to avoid CORS complexities.

## Assumptions
- Single backend instance; in-memory timers (no DB persistence). Timers reset on server restart.
- Static users and exams for the technical test.
- JWT used for basic auth; dev secret: `JWT_SECRET` (env). No refresh tokens.
- Students cannot start the exam; only admins can start/pause/reset/adjust.
- Timer is initialized to the exam default on first GET `/exams/:id/timer` or socket join.
- Admin logout or page close triggers a reset for the current exam.

## Config
Environment variables (backend):
- `PORT` (default 4000)
- `JWT_SECRET` (defaults to a dev secret if unset)