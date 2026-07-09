from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse

from app.api.router import router as api_router
from app.core.config import settings
from app.core.database import SessionLocal, init_db
from app.services.job_service import seed_mock_jobs
from app.services.storage import ensure_upload_dir

OPENAPI_TAGS = [
    {
        "name": "health",
        "description": "Service and dependency health checks.",
    },
    {
        "name": "documents",
        "description": "Resume upload and CV-driven LinkedIn search suggestions.",
    },
    {
        "name": "jobs",
        "description": "Job listings, fit scores, and LinkedIn sync controls.",
    },
    {
        "name": "sessions",
        "description": "Chat sessions, history, welcome seeding, and prompt suggestions.",
    },
    {
        "name": "chat",
        "description": "RAG chat against the uploaded resume and optional job context.",
    },
]


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
    description=(
        "Career Intelligence API — upload a resume, scrape LinkedIn roles, "
        "score fit, and chat with RAG-backed career guidance."
    ),
    debug=settings.debug,
    version="0.1.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    openapi_tags=OPENAPI_TAGS,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.api_prefix)


@app.get("/", include_in_schema=False)
async def root() -> RedirectResponse:
    return RedirectResponse(url="/docs")


@app.get("/health", tags=["health"])
async def health() -> dict[str, str]:
    return {"status": "ok", "service": "career-intelligence-api"}
