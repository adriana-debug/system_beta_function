<div align="center">
  <h1>OPEX360</h1>
  <p>Operational Excellence platform for BPO teams with AI insights, dashboards, and multi-tenant API.</p>
</div>

## Stack
- Frontend: React 19 + TypeScript (Vite 6), Recharts, lucide-react
- Backend: FastAPI (Python 3.11+), SQLModel/SQLAlchemy, Gemini client
- Database: MySQL 8 (docker-compose)
- Tooling: ESLint + Prettier, Black + Flake8, Docker for frontend/backend

## Getting Started (local dev)
1) Install dependencies
```bash
npm install
```
2) Frontend env: copy `.env.local` and set `GEMINI_API_KEY` (used for Vite define) and `VITE_API_URL` (defaults to http://localhost:8000)
3) Backend env: copy `backend/.env.example` to `backend/.env` and set `GEMINI_API_KEY` and `DATABASE_URL` if overriding
4) Run services
```bash
# start MySQL + backend + frontend
docker-compose up --build

# or run frontend only (expects backend at VITE_API_URL)
npm run dev
```

## Project Structure
- Frontend app root: `src`-style files in repo root (`App.tsx`, `components/`, `services/`)
- Backend API: `backend/` (FastAPI entrypoint `main.py`, models, schemas)
- Containers: `Dockerfile.frontend`, `backend/Dockerfile`, `docker-compose.yml`

## API
- Health: `GET /health`
- Auth: `POST /auth/signup`, `POST /auth/login`
- Tenants: `POST/GET /organizations`, `POST/GET /roles`, `POST/GET /users`
- Initiatives: `POST/GET /initiatives`
- AI: `POST /ai/prompt` (body: `{ prompt: string, workspace?: string, data_points?: [{label, value}] }`)

## Frontend Notes
- Alias `@` resolves to repo root (see `vite.config.ts`)
- `AiInsightsPanel` calls the `/ai/prompt` endpoint and visualizes chart data with Recharts
- Strict TypeScript is enabled; run `npm run lint` and `npm run format` before committing

## Backend Notes
- Uses SQLModel for ORM; update `backend/models.py` for new entities and add migrations (e.g., Alembic) as needed
- Configure CORS via `FRONTEND_ORIGIN` env (defaults allow localhost dev ports)
- Start locally without Docker: `uvicorn main:app --reload --host 0.0.0.0 --port 8000` from `backend/`
