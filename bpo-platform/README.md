# BPO Operations Platform

A production-ready internal operations platform for BPO companies, built with React (TypeScript), FastAPI (Python), and PostgreSQL.

## Tech Stack

### Frontend
- **Framework**: React 18 + TypeScript + Vite
- **State Management**: Zustand
- **API Handling**: TanStack Query (React Query)
- **UI Framework**: Tailwind CSS + ShadCN/UI
- **Charts**: Recharts
- **Tables**: TanStack Table
- **Forms**: React Hook Form + Zod
- **Authentication**: JWT-based

### Backend
- **Framework**: FastAPI (Python 3.11+)
- **ORM**: SQLAlchemy (async)
- **Migrations**: Alembic
- **Validation**: Pydantic v2
- **Authentication**: JWT + RBAC
- **Background Tasks**: FastAPI BackgroundTasks / Celery

### Database
- **PostgreSQL 15+**
- UUID primary keys
- Soft deletes
- Audit fields (created_at, updated_at, created_by)

## Project Structure

```
bpo-platform/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── api/            # API routes
│   │   ├── core/           # Core config, security
│   │   ├── db/             # Database setup
│   │   ├── models/         # SQLAlchemy models
│   │   ├── schemas/        # Pydantic schemas
│   │   ├── services/       # Business logic
│   │   └── main.py
│   ├── migrations/         # Alembic migrations
│   └── requirements.txt
├── frontend/               # React frontend
│   ├── src/
│   │   ├── app/           # App setup, providers
│   │   ├── components/    # Reusable UI components
│   │   ├── features/      # Feature modules
│   │   ├── hooks/         # Custom hooks
│   │   ├── services/      # API services
│   │   ├── store/         # Zustand stores
│   │   ├── themes/        # Theme configuration
│   │   └── utils/         # Utilities
│   └── package.json
├── docker-compose.yml
└── README.md
```

## Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 18+
- Python 3.11+
- PostgreSQL 15+

### Development Setup

1. **Clone and setup environment**
   ```bash
   cp .env.example .env
   ```

2. **Start with Docker Compose**
   ```bash
   docker-compose up -d
   ```

3. **Or run manually:**

   Backend:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # or `venv\Scripts\activate` on Windows
   pip install -r requirements.txt
   alembic upgrade head
   uvicorn app.main:app --reload
   ```

   Frontend:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

## Core Modules

- **User & Role Management**: Users, Roles (Admin, Manager, Agent, QA), Permissions
- **Departments**: CRUD, user assignment, hierarchy
- **Processes**: Business processes linked to departments
- **Workflows**: Multi-step workflows with configurable stages and SLA tracking
- **Analytics**: KPI dashboards, performance metrics, trends

## Theme System

Three brand color variants available:
- **Blue (Corporate)**: Default theme
- **Green (Operations)**: Success-focused
- **Purple (Analytics)**: Admin/analytics focused

Supports light and dark modes.

## API Versioning

All API endpoints are versioned under `/api/v1/`.

## License

Proprietary - Internal Use Only
