from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import router as api_router
from app.core.config import settings
from app.core.database import SessionLocal, init_db
from app.services.job_service import seed_mock_jobs
from app.services.storage import ensure_upload_dir


@asynccontextmanager
async def lifespan(_: FastAPI):
    ensure_upload_dir()
    init_db()

    if settings.seed_mock_jobs:
        with SessionLocal() as db:
            seed_mock_jobs(db)

    yield


app = FastAPI(
    title=settings.app_name,
    debug=settings.debug,
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.api_prefix)


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok", "service": "career-intelligence-api"}
