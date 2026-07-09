import logging

from openai import OpenAI
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.chat_message import ChatMessage, ChatRole
from app.schemas.chat import ChatRequest, ChatResponse
from app.services.job_service import get_job, list_jobs
from app.services.retrieval_service import format_context, retrieve_context
from app.services.session_service import get_session, get_session_document


SYSTEM_PROMPT = """You are a career intelligence assistant.

You analyze a candidate resume against job postings. Use ONLY the provided context.
If the answer is not in the context, say what is missing and suggest next steps.

Focus on:
- skill gaps and strengths
- experience alignment
- interview preparation tips
- comparisons when multiple jobs are in context

Be concise, structured, and actionable. Use bullet points when helpful."""

logger = logging.getLogger("app.chat")


def chat(db: Session, payload: ChatRequest) -> ChatResponse:
    session = get_session(db, payload.session_id)
    if not session:
        return ChatResponse(
            reply="Session not found. Upload your CV to start a new analysis.",
            job_id=None,
            grounded=False,
            sources=[],
        )

    resume = get_session_document(db, payload.session_id)
    job = get_job(db, payload.job_id) if payload.job_id else None

    db.add(
        ChatMessage(
            role=ChatRole.USER,
            content=payload.message,
            job_posting_id=job.id if job else None,
            session_id=session.id,
        )
    )

    reply, grounded, sources = build_reply(db, payload.message, resume, job)

    logger.info(
        "chat session=%s job=%s grounded=%s sources=%s message_len=%s",
        payload.session_id,
        payload.job_id,
        grounded,
        len(sources),
        len(payload.message),
    )

    db.add(
        ChatMessage(
            role=ChatRole.ASSISTANT,
            content=reply,
            job_posting_id=job.id if job else None,
            session_id=session.id,
        )
    )
    db.commit()

    return ChatResponse(
        reply=reply,
        job_id=job.id if job else None,
        grounded=grounded,
        sources=sources,
    )


def build_reply(db: Session, message: str, resume, job) -> tuple[str, bool, list[str]]:
    if not settings.llm_configured:
        context_parts = []
        if resume:
            context_parts.append(f"resume ({resume.filename})")
        if job:
            context_parts.append(f"{job.title} at {job.company}")
        context = " and ".join(context_parts) if context_parts else "no documents yet"
        return (
            f"Set OPENAI_API_KEY in .env to enable RAG answers. "
            f"Context available: {context}.",
            False,
            [],
        )

    if not resume:
        return (
            "Upload your CV first, then find matching roles. "
            "I need indexed resume text before I can analyze fit.",
            False,
            [],
        )

    jobs = list_jobs(db)
    if not jobs:
        return (
            "Find matching roles from LinkedIn first, then ask about fit, "
            "skill gaps, or interview prep.",
            False,
            [resume.filename],
        )

    try:
        chunks, compare_all = retrieve_context(
            db,
            message,
            job_id=job.id if job else None,
            resume_document_id=resume.id,
        )
    except Exception as exc:
        return (
            f"Retrieval failed: {exc}. Check OPENAI_API_KEY and that documents were indexed.",
            False,
            [resume.filename],
        )

    context = format_context(chunks)
    sources = sorted({chunk.source_label for chunk in chunks})
    if resume.filename not in sources:
        sources.insert(0, resume.filename)

    role_line = "All imported roles" if compare_all else (
        f"{job.title} at {job.company}" if job else "No specific role selected"
    )

    user_prompt = f"""Active role context: {role_line}

Retrieved context:
{context}

Question:
{message}"""

    client = OpenAI(api_key=settings.openai_api_key)
    response = client.chat.completions.create(
        model=settings.openai_chat_model,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ],
        temperature=0.3,
        max_tokens=900,
    )

    reply = response.choices[0].message.content or "No response generated."
    grounded = bool(chunks)
    return reply.strip(), grounded, sources
