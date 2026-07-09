from fastapi import APIRouter

from app.api.v1 import chat, documents, health, jobs, sessions

router = APIRouter()

router.include_router(health.router)
router.include_router(documents.router)
router.include_router(jobs.router)
router.include_router(sessions.router)
router.include_router(chat.router)
