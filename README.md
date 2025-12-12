FUSION
========

Production deployment guide (backend on Render, frontend as static build).

## Backend (Render)
- Repo: `D:/repositories/backend` (Express + Mongo).
- Start command: `node server.js` (Render will inject `PORT`).
- Required env vars: `MONGODB_URI`, `GROQ_API_KEY`, `GOOGLE_CLIENT_ID`, `FRONTEND_URL` (your deployed frontend origin), optional `PORT` (Render sets it).
- Health check: `GET /api/health` should return 200.
- Google config endpoint: `GET /api/config/google-client-id` must return the client ID.

## Frontend (FUSION)
- Build: `npm install` then `npm run build` (creates `dist/`).
- Deploy `dist/` to a static host (Render static, Netlify, Vercel, etc.).
- Env var for build: `VITE_BACKEND_URL` set to your deployed backend root URL (no trailing `/api`, e.g., `https://your-backend.onrender.com`).
- No `VITE_GOOGLE_CLIENT_ID` needed; the app fetches it from the backend.

## Local development
- Backend: from `D:/repositories/backend`, create `.env` (see `.env.example`), run `npm install`, then `node server.js`.
- Frontend: from `D:/repositories/FUSION`, set `.env` or `.env.local` with `VITE_BACKEND_URL=http://localhost:3001`, run `npm install`, then `npm run dev`.

## Notes
- CORS: backend uses `FRONTEND_URL` allowlist; set it to your production frontend origin.
- Mongo: uses database `fusion_ai`; ensure your MongoDB Atlas IP allowlist includes Render outbound IPs.
- Keep secrets out of the repo; use `.env.example` as the template and configure real values in the hosting dashboard.
