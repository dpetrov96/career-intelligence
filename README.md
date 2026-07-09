# Career Intelligence

AI assistant that analyzes resumes against job descriptions — skill gaps, experience alignment, and interview preparation.

## Project structure

```
career-intelligence/
├── frontend/          # Next.js (UI)
├── backend/           # FastAPI (API + RAG pipeline)
├── infra/             # Database init scripts
└── docker-compose.yml
```

## Prerequisites

- Docker & Docker Compose
- Node.js 20+ (for local frontend dev)
- Python 3.12+ (for local backend dev)

## Quick start (Docker)

```bash
cp .env.example .env
docker compose up --build
```

Services:

| Service  | URL                        |
|----------|----------------------------|
| Frontend | http://localhost:3000      |
| API      | http://localhost:8000      |
| API docs | http://localhost:8000/docs |
| Postgres | localhost:5432             |

## Local development (without Docker)

### Database

```bash
docker compose up db -d
```

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Health checks

- Backend: `GET http://localhost:8000/health`
- API v1:   `GET http://localhost:8000/api/v1/health`

## Roadmap

- [ ] Document upload (resume + job descriptions)
- [ ] Ingestion pipeline (parse, chunk, embed)
- [ ] PostgreSQL + pgvector schema
- [ ] RAG chat with LlamaIndex
- [ ] Skill gap analysis UI
