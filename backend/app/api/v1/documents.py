from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, status
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.schemas.document import DocumentResponse, ResumeSearchSuggestion, ResumeUploadResponse
from app.services import document_service, session_service
from app.services.resume_analysis_service import analyze_resume_for_linkedin

router = APIRouter(prefix="/documents", tags=["documents"])


def _to_response(document) -> DocumentResponse:
    preview = None
    if document.content_text:
        preview = document.content_text[:280].strip()
        if len(document.content_text) > 280:
            preview += "…"

    return DocumentResponse(
        id=document.id,
        kind=document.kind.value,
        filename=document.filename,
        mime_type=document.mime_type,
        content_preview=preview,
        created_at=document.created_at,
    )


def _resolve_resume(db: Session, session_id: int | None):
    if session_id is not None:
        document = session_service.get_session_document(db, session_id)
        if not document:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Session not found",
            )
        return document

    document = document_service.get_resume(db)
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No resume uploaded yet",
        )
    return document


@router.get("/resume", response_model=DocumentResponse)
def get_resume(
    session_id: int | None = Query(default=None),
    db: Session = Depends(get_db),
) -> DocumentResponse:
    return _to_response(_resolve_resume(db, session_id))


@router.get("/resume/suggestions", response_model=ResumeSearchSuggestion)
def get_resume_search_suggestions(
    session_id: int | None = Query(default=None),
    db: Session = Depends(get_db),
) -> ResumeSearchSuggestion:
    document = _resolve_resume(db, session_id)
    profile = analyze_resume_for_linkedin(document.content_text)
    keyword_alternatives = [
        item
        for item in profile.keyword_alternatives
        if item.lower() != profile.keywords.lower()
    ]
    return ResumeSearchSuggestion(
        keywords=profile.keywords,
        keyword_alternatives=keyword_alternatives[:4],
        location=profile.location,
        geo_id=profile.geo_id,
        headline=profile.headline,
    )


@router.post("/resume", response_model=ResumeUploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_resume(
    file: UploadFile,
    db: Session = Depends(get_db),
) -> ResumeUploadResponse:
    document, session_id = await document_service.upload_resume(db, file)
    return ResumeUploadResponse(
        document=_to_response(document),
        session_id=session_id,
    )
