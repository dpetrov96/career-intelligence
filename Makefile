.PHONY: up down logs api frontend db

up:
	docker compose up --build

down:
	docker compose down

logs:
	docker compose logs -f

api:
	cd backend && uvicorn app.main:app --reload --port 8000

frontend:
	cd frontend && npm run dev

db:
	docker compose up db -d
