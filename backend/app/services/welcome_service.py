import json

from sqlalchemy.orm import Session

from app.models.chat_message import ChatMessage, ChatRole
from app.models.job_posting import JobPosting
from app.services import job_service, session_service
from app.services.match_service import score_all_jobs

MATCH_CHIPS_PREFIX = "__MATCH_CHIPS__:"
MAX_ALTERNATE_MATCHES = 8


def build_welcome_message_with_score(
    *,
    job: JobPosting,
    match_count: int,
    resume_filename: str,
    match_score: float | None = None,
) -> str:
    fit_line = ""
    if match_score is not None:
        fit_line = f" with a {match_score:.0f}% fit score"

    role_line = f"**{job.title}** at **{job.company}**"

    return (
        f"Your CV ({resume_filename}) is indexed and I've reviewed {match_count} "
        f"matching open roles.\n\n"
        f"Your top match is {role_line}{fit_line}. I'm ready to analyze how your "
        f"background aligns with this position.\n\n"
        f"You can ask me about:\n"
        f"• Skill gaps for this role\n"
        f"• How your experience maps to the requirements\n"
        f"• Interview prep tailored to this company\n"
        f"• Or say **compare all jobs** to rank every match\n\n"
        f"What would you like to explore first?"
    )


def _build_match_chips_content(jobs: list[JobPosting], scores: dict[int, float]) -> str:
    payload = {
        "jobs": [
            {
                "id": job.id,
                "title": job.title,
                "company": job.company,
                "domain": job.domain,
                "logo_url": job.logo_url,
                "match_score": scores.get(job.id),
            }
            for job in jobs
        ],
    }
    return f"{MATCH_CHIPS_PREFIX}{json.dumps(payload)}"


def _rank_jobs_for_session(db: Session, session_id: int) -> tuple[list[JobPosting], dict[int, float]]:
    document = session_service.get_session_document(db, session_id)
    document_id = document.id if document else None
    jobs = job_service.list_jobs(db)
    scores = score_all_jobs(db, document_id=document_id)
    ranked = sorted(
        jobs,
        key=lambda job: scores.get(job.id, -1.0),
        reverse=True,
    )
    return ranked, scores


def seed_welcome_message(
    db: Session,
    session_id: int,
    *,
    job_id: int,
    match_count: int,
    match_score: float | None = None,
) -> list[ChatMessage]:
    session = session_service.get_session(db, session_id)
    if not session:
        return []

    existing = (
        db.query(ChatMessage)
        .filter(ChatMessage.session_id == session_id)
        .order_by(ChatMessage.created_at.asc())
        .all()
    )
    if existing:
        return existing

    job = job_service.get_job(db, job_id)
    if not job:
        return []

    resume_filename = session.document.filename if session.document else session.title
    content = build_welcome_message_with_score(
        job=job,
        match_count=match_count,
        resume_filename=resume_filename,
        match_score=match_score,
    )

    welcome = ChatMessage(
        role=ChatRole.ASSISTANT,
        content=content,
        job_posting_id=job.id,
        session_id=session_id,
    )
    db.add(welcome)

    ranked_jobs, scores = _rank_jobs_for_session(db, session_id)
    alternate_jobs = [item for item in ranked_jobs if item.id != job_id][:MAX_ALTERNATE_MATCHES]

    created = [welcome]
    if alternate_jobs:
        chips_message = ChatMessage(
            role=ChatRole.ASSISTANT,
            content=_build_match_chips_content(alternate_jobs, scores),
            job_posting_id=None,
            session_id=session_id,
        )
        db.add(chips_message)
        created.append(chips_message)

    db.commit()
    for message in created:
        db.refresh(message)
    return created
