from sqlalchemy.orm import Session

from app.models.document import Document
from app.models.document_chunk import DocumentChunk
from app.models.job_posting import JobPosting
from app.services.chunking import chunk_text
from app.services.embedding_service import embed_texts


def _replace_chunks(
    db: Session,
    *,
    document_id: int | None = None,
    job_posting_id: int | None = None,
) -> None:
    query = db.query(DocumentChunk)
    if document_id is not None:
        query = query.filter(DocumentChunk.document_id == document_id)
    if job_posting_id is not None:
        query = query.filter(DocumentChunk.job_posting_id == job_posting_id)
    query.delete(synchronize_session=False)


def ingest_resume(db: Session, document: Document) -> int:
    text = document.content_text or ""
    chunks = chunk_text(text)
    _replace_chunks(db, document_id=document.id)

    if not chunks:
        db.commit()
        return 0

    vectors = embed_texts(chunks)
    for index, (content, vector) in enumerate(zip(chunks, vectors, strict=True)):
        db.add(
            DocumentChunk(
                document_id=document.id,
                chunk_index=index,
                source_label=document.filename,
                content=content,
                embedding=vector,
            ),
        )
    db.commit()
    return len(chunks)


def ingest_job_posting(db: Session, job: JobPosting) -> int:
    parts = [job.title, job.company, job.location, job.description_text or ""]
    text = "\n\n".join(part.strip() for part in parts if part and part.strip())
    chunks = chunk_text(text)
    _replace_chunks(db, job_posting_id=job.id)

    if not chunks:
        db.commit()
        return 0

    label = f"{job.title} @ {job.company}"
    vectors = embed_texts(chunks)
    for index, (content, vector) in enumerate(zip(chunks, vectors, strict=True)):
        db.add(
            DocumentChunk(
                job_posting_id=job.id,
                chunk_index=index,
                source_label=label,
                content=content,
                embedding=vector,
            ),
        )
    db.commit()
    return len(chunks)
