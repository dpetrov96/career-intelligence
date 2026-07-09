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

<img width="1470" height="835" alt="image" src="https://github.com/user-attachments/assets/059fc617-2e17-48cf-a62e-12193e6b6018" />
￼
<img width="1470" height="833" alt="image" src="https://github.com/user-attachments/assets/4eff3b99-a0f4-4f47-980b-e6653c87c535" />

<img width="1470" height="834" alt="image" src="https://github.com/user-attachments/assets/cbe57b44-0b02-44e6-96d0-a7c037089b22" />

<img width="1470" height="835" alt="image" src="https://github.com/user-attachments/assets/20bb4fd3-586f-42d1-9e21-3f57970e6932" />

<img width="1470" height="837" alt="image" src="https://github.com/user-attachments/assets/c60ee996-6640-46e9-8bda-705be04c0ed6" />
￼
<img width="1470" height="834" alt="image" src="https://github.com/user-attachments/assets/654f38d9-561b-413d-892f-fa2fe468a82f" />


