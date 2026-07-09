from sqlalchemy.orm import Session

from app.models.job_posting import JobPosting, WorkType
from app.schemas.job import JobPostingCreate


def list_jobs(db: Session) -> list[JobPosting]:
    return db.query(JobPosting).order_by(JobPosting.id.asc()).all()


def get_job(db: Session, job_id: int) -> JobPosting | None:
    return db.query(JobPosting).filter(JobPosting.id == job_id).first()


def create_job(db: Session, payload: JobPostingCreate) -> JobPosting:
    job = JobPosting(
        title=payload.title,
        company=payload.company,
        domain=payload.domain,
        location=payload.location,
        work_type=payload.type,
        description_text=payload.description_text,
    )
    db.add(job)
    db.commit()
    db.refresh(job)
    return job


def delete_job(db: Session, job: JobPosting) -> None:
    db.delete(job)
    db.commit()


MOCK_JOBS: list[dict] = [
    {
        "title": "Senior Frontend Engineer",
        "company": "Stripe",
        "domain": "stripe.com",
        "location": "Remote",
        "work_type": WorkType.REMOTE,
    },
    {
        "title": "Full Stack Developer",
        "company": "Notion",
        "domain": "notion.so",
        "location": "San Francisco, CA",
        "work_type": WorkType.HYBRID,
    },
    {
        "title": "Staff Engineer",
        "company": "Vercel",
        "domain": "vercel.com",
        "location": "Remote",
        "work_type": WorkType.REMOTE,
    },
    {
        "title": "Frontend Engineer",
        "company": "Linear",
        "domain": "linear.app",
        "location": "Remote",
        "work_type": WorkType.REMOTE,
    },
    {
        "title": "Software Engineer",
        "company": "Google",
        "domain": "google.com",
        "location": "London, UK",
        "work_type": WorkType.HYBRID,
    },
    {
        "title": "React Developer",
        "company": "Airbnb",
        "domain": "airbnb.com",
        "location": "Remote",
        "work_type": WorkType.REMOTE,
    },
    {
        "title": "Lead Engineer",
        "company": "Shopify",
        "domain": "shopify.com",
        "location": "Toronto, CA",
        "work_type": WorkType.HYBRID,
    },
    {
        "title": "Platform Engineer",
        "company": "Datadog",
        "domain": "datadoghq.com",
        "location": "New York, NY",
        "work_type": WorkType.ON_SITE,
    },
]


def seed_mock_jobs(db: Session) -> None:
    if db.query(JobPosting).count() > 0:
        return

    for item in MOCK_JOBS:
        db.add(JobPosting(**item))
    db.commit()
