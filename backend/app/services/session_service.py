from sqlalchemy.orm import Session

from app.models.chat_message import ChatMessage
from app.models.chat_session import ChatSession
from app.models.document import Document


def create_session(db: Session, *, document_id: int, title: str) -> ChatSession:
    session = ChatSession(document_id=document_id, title=title)
    db.add(session)
    db.commit()
    db.refresh(session)
    return session


def list_sessions(db: Session) -> list[ChatSession]:
    return (
        db.query(ChatSession)
        .order_by(ChatSession.created_at.desc())
        .all()
    )


def get_session(db: Session, session_id: int) -> ChatSession | None:
    return db.query(ChatSession).filter(ChatSession.id == session_id).first()


def get_session_messages(db: Session, session_id: int) -> list[ChatMessage]:
    return (
        db.query(ChatMessage)
        .filter(ChatMessage.session_id == session_id)
        .order_by(ChatMessage.created_at.asc())
        .all()
    )


def get_session_document(db: Session, session_id: int) -> Document | None:
    session = get_session(db, session_id)
    if not session:
        return None
    return session.document
