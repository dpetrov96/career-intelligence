from fastapi import UploadFile
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.document import Document, DocumentKind
from app.services.ingestion_service import ingest_resume
from app.services.session_service import create_session
from app.services.storage import save_upload
from app.services.text_extractor import extract_text


def get_resume(db: Session) -> Document | None:
    return (
        db.query(Document)
        .filter(Document.kind == DocumentKind.RESUME)
        .order_by(Document.created_at.desc())
        .first()
    )


def get_document(db: Session, document_id: int) -> Document | None:
    return db.query(Document).filter(Document.id == document_id).first()


async def upload_resume(db: Session, file: UploadFile) -> tuple[Document, int]:
    storage_path, filename = await save_upload(file, prefix="resume")

    try:
        content_text = extract_text(storage_path, file.content_type)
    except Exception:
        content_text = None

    document = Document(
        kind=DocumentKind.RESUME,
        filename=filename,
        mime_type=file.content_type,
        storage_path=str(storage_path),
        content_text=content_text,
    )
    db.add(document)
    db.commit()
    db.refresh(document)

    if settings.llm_configured and content_text:
        try:
            ingest_resume(db, document)
        except Exception:
            pass

    session = create_session(db, document_id=document.id, title=filename)
    return document, session.id
