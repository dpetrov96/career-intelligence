# Career Intelligence (Option 4)

RAG assistant: upload a CV, compare it to job postings, ask about fit, skill gaps, and interview prep.

**Stack:** Next.js · FastAPI · PostgreSQL + pgvector · OpenAI

## Start

```bash
cp .env.example .env   # add OPENAI_API_KEY
docker compose up --build
```

| | |
|---|---|
| App | http://localhost:3000 |
| Swagger | http://localhost:8000/docs |

Reset: `docker compose down -v && docker compose up -d` · Tests: `make test`

## What it does

1. **Upload CV** — parsed, chunked, embedded (pgvector).
2. **Import roles** — ranked by fit score against your CV.
3. **Chat** — RAG over resume + selected job; suggested prompts, role context.

**Bonus (not required by the brief):** **LinkedIn scrape** — CV is analyzed for keywords/region, then open roles are imported automatically (“Scrape from LinkedIn” in chat or “Scrape more” in the panel).

## Demo

https://github.com/user-attachments/assets/00b4312c-006f-4f00-b69c-760e86ad3904

<img width="1470" height="835" alt="CV upload" src="https://github.com/user-attachments/assets/059fc617-2e17-48cf-a62e-12193e6b6018" />

<img width="1470" height="833" alt="LinkedIn scrape" src="https://github.com/user-attachments/assets/4eff3b99-a0f4-4f47-980b-e6653c87c535" />

<img width="1470" height="835" alt="Ranked matches" src="https://github.com/user-attachments/assets/20bb4fd3-586f-42d1-9e21-3f57970e6932" />

<img width="1470" height="837" alt="Chat" src="https://github.com/user-attachments/assets/c60ee996-6640-46e9-8bda-705be04c0ed6" />
