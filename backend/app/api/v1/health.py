from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.core.config import settings

router = APIRouter(tags=["health"])


@router.get("/health")
def api_health(db: Session = Depends(get_db)) -> dict:
    try:
        db.execute(text("SELECT 1"))
        database = "ok"
    except Exception:
        database = "error"

    status = "ok" if database == "ok" else "degraded"
    return {
        "status": status,
        "service": "career-intelligence-api",
        "database": database,
        "llm_configured": settings.llm_configured,
    }
