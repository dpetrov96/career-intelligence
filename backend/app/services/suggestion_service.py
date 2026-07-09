import json

from sqlalchemy.orm import Session

from app.core.config import settings
from app.services import job_service
from app.services.embedding_service import get_client
from app.services.match_service import score_all_jobs
from app.services.resume_analysis_service import analyze_resume_for_linkedin
from app.services.session_service import get_session_document, get_session_messages

MAX_PROMPTS = 4
MAX_PROMPT_LEN = 72

FALLBACK_PROMPTS = [
    "What skill gaps do I have for this role?",
    "How does my experience align with the requirements?",
    "Help me prepare for an interview at this company",
    "Compare all jobs and rank my best fits",
]

DEFAULT_LINKEDIN_KEYWORDS = [
    "software engineer",
    "frontend developer",
    "full stack developer",
    "data engineer",
    "product manager",
]


def _fallback_prompts(job_title: str | None, company: str | None) -> list[str]:
    if job_title and company:
        return [
            f"What skills am I missing for {job_title}?",
            f"How well do I fit {job_title} at {company}?",
            f"Interview prep for {company}",
            "Compare all imported roles for me",
        ]
    if job_title:
        return [
            f"What skills am I missing for {job_title}?",
            f"How does my background fit {job_title}?",
            "What should I highlight in my application?",
            "Compare all imported roles for me",
        ]
    return FALLBACK_PROMPTS[:MAX_PROMPTS]


def suggest_chat_prompts(
    db: Session,
    session_id: int,
    job_id: int | None = None,
) -> list[str]:
    resume = get_session_document(db, session_id)
    if not resume:
        return FALLBACK_PROMPTS[:MAX_PROMPTS]

    job = job_service.get_job(db, job_id) if job_id else None
    messages = get_session_messages(db, session_id)
    recent = messages[-8:]

    jobs = job_service.list_jobs(db)
    scores = score_all_jobs(db, document_id=resume.id)
    ranked_jobs = sorted(
        jobs,
        key=lambda item: scores.get(item.id, -1.0),
        reverse=True,
    )[:5]

    fallback = _fallback_prompts(
        job.title if job else (ranked_jobs[0].title if ranked_jobs else None),
        job.company if job else (ranked_jobs[0].company if ranked_jobs else None),
    )

    if not settings.llm_configured:
        return fallback

    chat_lines = []
    for message in recent:
        speaker = "User" if message.role.value == "user" else "Assistant"
        chat_lines.append(f"{speaker}: {message.content[:320]}")

    job_lines = [
        f"- {item.title} at {item.company} ({scores.get(item.id, '?')}% fit)"
        for item in ranked_jobs
    ]

    role_context = (
        f"{job.title} at {job.company}"
        if job
        else "No specific role selected — suggest prompts for the top match"
    )

    system = """You suggest short chat prompts for a career intelligence assistant.

Return JSON only: {"prompts": ["...", "..."]}

Rules:
- Exactly 4 prompts
- Each prompt max 65 characters, written as a question the user would tap
- Base prompts on the resume, active role, imported jobs, and recent chat
- If the user already discussed a topic, suggest natural follow-ups instead of repeats
- Mix skill gaps, fit analysis, interview prep, and job comparisons when multiple roles exist
- Do not mention JSON or that you are an AI"""

    user_content = f"""Active role: {role_context}

Top matched jobs:
{chr(10).join(job_lines) if job_lines else "None imported yet"}

Recent chat:
{chr(10).join(chat_lines) if chat_lines else "No messages yet — user just arrived"}

Resume excerpt:
{(resume.content_text or "")[:2200]}"""

    try:
        client = get_client()
        response = client.chat.completions.create(
            model=settings.openai_chat_model,
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": user_content},
            ],
            temperature=0.4,
            max_tokens=220,
            response_format={"type": "json_object"},
        )
        raw = response.choices[0].message.content or "{}"
        data = json.loads(raw)
        prompts = [
            prompt.strip()
            for prompt in data.get("prompts", [])
            if isinstance(prompt, str) and prompt.strip()
        ]
        prompts = [prompt[:MAX_PROMPT_LEN] for prompt in prompts[:MAX_PROMPTS]]
        if len(prompts) >= 3:
            return prompts
    except Exception:
        pass

    return fallback


def suggest_linkedin_keywords(content: str | None) -> list[str]:
    profile = analyze_resume_for_linkedin(content)
    keywords = [profile.keywords, *profile.keyword_alternatives]

    if not settings.llm_configured:
        for item in DEFAULT_LINKEDIN_KEYWORDS:
            if item.lower() != profile.keywords.lower():
                keywords.append(item)
            if len(keywords) >= 5:
                break
        return keywords[:5]

    text = (content or "").strip()
    if not text:
        return DEFAULT_LINKEDIN_KEYWORDS[:5]

    if len(keywords) >= 3:
        return keywords[:5]

    system = """You suggest LinkedIn job search keyword phrases for a candidate.

Return JSON only: {"keywords": ["...", "..."]}

Rules:
- 4 to 5 short phrases, 2-4 words each
- Include the best primary role plus related alternatives
- Keywords only, no punctuation or locations"""

    try:
        client = get_client()
        response = client.chat.completions.create(
            model=settings.openai_chat_model,
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": text[:4000]},
            ],
            temperature=0.2,
            max_tokens=120,
            response_format={"type": "json_object"},
        )
        raw = response.choices[0].message.content or "{}"
        data = json.loads(raw)
        generated = [
            item.strip()
            for item in data.get("keywords", [])
            if isinstance(item, str) and item.strip()
        ]
        for item in generated:
            if item.lower() not in {value.lower() for value in keywords}:
                keywords.append(item[:80])
            if len(keywords) >= 5:
                break
        if len(keywords) >= 3:
            return keywords[:5]
    except Exception:
        pass

    for item in DEFAULT_LINKEDIN_KEYWORDS:
        if item.lower() != profile.keywords.lower():
            keywords.append(item)
        if len(keywords) >= 5:
            break
    return keywords[:5]
