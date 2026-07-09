import math

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.document import Document, DocumentKind
from app.models.document_chunk import DocumentChunk
from app.models.job_posting import JobPosting
from app.services.document_service import get_resume


def _mean_vector(vectors: list[list[float]]) -> list[float] | None:
    if not vectors:
        return None
    size = len(vectors[0])
    totals = [0.0] * size
    for vector in vectors:
        for index, value in enumerate(vector):
            totals[index] += float(value)
    count = float(len(vectors))
    return [value / count for value in totals]


def _cosine_similarity(a: list[float], b: list[float]) -> float:
    dot = sum(x * y for x, y in zip(a, b, strict=True))
    norm_a = math.sqrt(sum(x * x for x in a))
    norm_b = math.sqrt(sum(y * y for y in b))
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return dot / (norm_a * norm_b)


def _chunk_vectors(db: Session, *, document_id: int | None = None, job_id: int | None = None) -> list[list[float]]:
    query = select(DocumentChunk.embedding)
    if document_id is not None:
        query = query.where(DocumentChunk.document_id == document_id)
    if job_id is not None:
        query = query.where(DocumentChunk.job_posting_id == job_id)
    rows = db.execute(query).scalars().all()
    return [list(row) for row in rows]


def score_job_against_resume(db: Session, job: JobPosting, resume_vector: list[float] | None) -> float | None:
    if resume_vector is None:
        return None

    job_vectors = _chunk_vectors(db, job_id=job.id)
    job_vector = _mean_vector(job_vectors)
    if job_vector is None:
        return None

    similarity = _cosine_similarity(resume_vector, job_vector)
    return round(max(0.0, min(100.0, similarity * 100)), 1)


def score_all_jobs(db: Session, document_id: int | None = None) -> dict[int, float]:
    if document_id is not None:
        resume = db.query(Document).filter(Document.id == document_id).first()
    else:
        resume = get_resume(db)
    if not resume:
        return {}

    resume_vector = _mean_vector(_chunk_vectors(db, document_id=resume.id))
    if resume_vector is None:
        return {}

    scores: dict[int, float] = {}
    for job in db.query(JobPosting).order_by(JobPosting.id.asc()).all():
        score = score_job_against_resume(db, job, resume_vector)
        if score is not None:
            scores[job.id] = score
    return scores
