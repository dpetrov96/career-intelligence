from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.models.chat_message import ChatMessage
from app.schemas.session import (
    ChatMessageResponse,
    ChatSessionResponse,
    SuggestedPromptsResponse,
    WelcomeSeedResponse,
)
from app.services import session_service
from app.services.suggestion_service import suggest_chat_prompts
from app.services.welcome_service import seed_welcome_message

router = APIRouter(prefix="/sessions", tags=["sessions"])


def _to_session_response(session, message_count: int = 0) -> ChatSessionResponse:
    return ChatSessionResponse(
        id=session.id,
        document_id=session.document_id,
        title=session.title,
        resume_filename=session.document.filename if session.document else session.title,
        created_at=session.created_at,
        updated_at=session.updated_at,
        message_count=message_count,
    )


@router.get("", response_model=list[ChatSessionResponse])
def list_sessions(db: Session = Depends(get_db)) -> list[ChatSessionResponse]:
    sessions = session_service.list_sessions(db)
    counts = dict(
        db.query(ChatMessage.session_id, func.count(ChatMessage.id))
        .filter(ChatMessage.session_id.isnot(None))
        .group_by(ChatMessage.session_id)
        .all()
    )
    return [_to_session_response(session, counts.get(session.id, 0)) for session in sessions]


@router.get("/{session_id}", response_model=ChatSessionResponse)
def get_session(session_id: int, db: Session = Depends(get_db)) -> ChatSessionResponse:
    session = session_service.get_session(db, session_id)
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")

    message_count = (
        db.query(func.count(ChatMessage.id))
        .filter(ChatMessage.session_id == session_id)
        .scalar()
        or 0
    )
    return _to_session_response(session, message_count)


@router.get("/{session_id}/messages", response_model=list[ChatMessageResponse])
def get_session_messages(
    session_id: int,
    db: Session = Depends(get_db),
) -> list[ChatMessageResponse]:
    session = session_service.get_session(db, session_id)
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")

    messages = session_service.get_session_messages(db, session_id)
    return [
        ChatMessageResponse(
            id=message.id,
            role=message.role.value,
            content=message.content,
            job_posting_id=message.job_posting_id,
            created_at=message.created_at,
        )
        for message in messages
    ]


@router.get("/{session_id}/suggested-prompts", response_model=SuggestedPromptsResponse)
def get_suggested_prompts(
    session_id: int,
    job_id: int | None = Query(default=None),
    db: Session = Depends(get_db),
) -> SuggestedPromptsResponse:
    session = session_service.get_session(db, session_id)
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")

    prompts = suggest_chat_prompts(db, session_id, job_id=job_id)
    return SuggestedPromptsResponse(prompts=prompts)


@router.post("/{session_id}/welcome", response_model=WelcomeSeedResponse)
def create_welcome_message(
    session_id: int,
    job_id: int = Query(...),
    match_count: int = Query(default=1, ge=1),
    match_score: float | None = Query(default=None),
    db: Session = Depends(get_db),
) -> WelcomeSeedResponse:
    session = session_service.get_session(db, session_id)
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")

    messages = seed_welcome_message(
        db,
        session_id,
        job_id=job_id,
        match_count=match_count,
        match_score=match_score,
    )
    if not messages:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Could not create welcome message",
        )

    return WelcomeSeedResponse(
        messages=[
            ChatMessageResponse(
                id=message.id,
                role=message.role.value,
                content=message.content,
                job_posting_id=message.job_posting_id,
                created_at=message.created_at,
            )
            for message in messages
        ]
    )
