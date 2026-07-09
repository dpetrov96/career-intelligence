from dataclasses import dataclass

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.document import Document, DocumentKind
from app.models.document_chunk import DocumentChunk
from app.models.job_posting import JobPosting
from app.services.embedding_service import embed_texts


@dataclass
class RetrievedChunk:
    content: str
    source_label: str
    score: float


def _is_compare_all_query(message: str) -> bool:
    lowered = message.lower()
    return "compare" in lowered and ("all" in lowered or "jobs" in lowered)


def retrieve_context(
    db: Session,
    query: str,
    *,
    job_id: int | None,
    resume_document_id: int | None = None,
    top_k: int | None = None,
) -> tuple[list[RetrievedChunk], bool]:
    limit = top_k or settings.rag_top_k
    compare_all = _is_compare_all_query(query)
    query_vector = embed_texts([query])[0]

    resume = None
    if resume_document_id is not None:
        resume = db.query(Document).filter(Document.id == resume_document_id).first()
    if resume is None:
        resume = (
            db.query(Document)
            .filter(Document.kind == DocumentKind.RESUME)
            .order_by(Document.created_at.desc())
            .first()
        )

    chunks: list[RetrievedChunk] = []

    if resume:
        chunks.extend(
            _search_chunks(
                db,
                query_vector,
                DocumentChunk.document_id == resume.id,
                per_source=max(3, limit // 2),
            ),
        )

    if compare_all:
        jobs = db.query(JobPosting).order_by(JobPosting.id.asc()).all()
        per_job = max(2, limit // max(len(jobs), 1))
        for job in jobs[:10]:
            chunks.extend(
                _search_chunks(
                    db,
                    query_vector,
                    DocumentChunk.job_posting_id == job.id,
                    per_source=per_job,
                ),
            )
    elif job_id is not None:
        chunks.extend(
            _search_chunks(
                db,
                query_vector,
                DocumentChunk.job_posting_id == job_id,
                per_source=limit,
            ),
        )

    chunks.sort(key=lambda item: item.score)
    return chunks[:limit], compare_all


def _search_chunks(
    db: Session,
    query_vector: list[float],
    filter_clause,
    *,
    per_source: int,
) -> list[RetrievedChunk]:
    distance = DocumentChunk.embedding.cosine_distance(query_vector)
    stmt = (
        select(DocumentChunk, distance.label("distance"))
        .where(filter_clause)
        .order_by(distance)
        .limit(per_source)
    )
    rows = db.execute(stmt).all()
    return [
        RetrievedChunk(
            content=chunk.content,
            source_label=chunk.source_label,
            score=float(dist),
        )
        for chunk, dist in rows
    ]


def format_context(chunks: list[RetrievedChunk]) -> str:
    if not chunks:
        return "No indexed context was retrieved."

    parts: list[str] = []
    for index, chunk in enumerate(chunks, start=1):
        parts.append(
            f"[{index}] Source: {chunk.source_label}\n{chunk.content}",
        )
    return "\n\n".join(parts)
