from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.models.job_posting import JobPosting
from app.schemas.job import (
    JobPostingCreate,
    JobPostingResponse,
    LinkedInSyncRequest,
    LinkedInSyncResponse,
    LinkedInSyncStatusResponse,
)
from app.services import job_service, session_service
from app.services.match_service import score_all_jobs
from app.services.linkedin_sync_runner import SyncStatus, linkedin_sync_runner

router = APIRouter(prefix="/jobs", tags=["jobs"])


def _to_response(job: JobPosting, match_score: float | None = None) -> JobPostingResponse:
    return JobPostingResponse(
        id=job.id,
        title=job.title,
        company=job.company,
        domain=job.domain,
        location=job.location,
        type=job.work_type,
        source=job.source,
        linkedin_url=job.linkedin_url,
        logo_url=job.logo_url,
        match_score=match_score,
    )


def _status_response() -> LinkedInSyncStatusResponse:
    state = linkedin_sync_runner.get_state()
    if not state:
        return LinkedInSyncStatusResponse()

    running = state.status in {SyncStatus.SEARCHING, SyncStatus.IMPORTING}
    return LinkedInSyncStatusResponse(
        sync_id=state.sync_id,
        status=state.status.value,
        keywords=state.keywords,
        location=state.location,
        geo_id=state.geo_id,
        limit=state.limit,
        phase=state.phase,
        current=state.current,
        total=state.total,
        imported=state.imported,
        skipped=state.skipped,
        current_item=state.current_item,
        message=state.message,
        blocked=state.blocked,
        running=running,
        job_ids=state.job_ids,
    )


@router.get("", response_model=list[JobPostingResponse])
def list_jobs(
    session_id: int | None = Query(default=None),
    db: Session = Depends(get_db),
) -> list[JobPostingResponse]:
    document_id = None
    if session_id is not None:
        document = session_service.get_session_document(db, session_id)
        if not document:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
        document_id = document.id

    jobs = job_service.list_jobs(db)
    scores = score_all_jobs(db, document_id=document_id)
    ranked = sorted(
        jobs,
        key=lambda job: scores.get(job.id, -1.0),
        reverse=True,
    )
    return [_to_response(job, scores.get(job.id)) for job in ranked]


@router.post("", response_model=JobPostingResponse, status_code=status.HTTP_201_CREATED)
def create_job(
    payload: JobPostingCreate,
    db: Session = Depends(get_db),
) -> JobPostingResponse:
    job = job_service.create_job(db, payload)
    return _to_response(job)


@router.get("/sync/linkedin/status", response_model=LinkedInSyncStatusResponse)
def get_linkedin_sync_status() -> LinkedInSyncStatusResponse:
    return _status_response()


@router.post("/sync/linkedin/start", response_model=LinkedInSyncStatusResponse)
def start_linkedin_sync(
    payload: LinkedInSyncRequest | None = None,
) -> LinkedInSyncStatusResponse:
    if linkedin_sync_runner.is_running():
        return _status_response()

    options = payload or LinkedInSyncRequest()
    linkedin_sync_runner.start(
        keywords=options.keywords,
        location=options.location,
        geo_id=options.geo_id,
        limit=options.limit,
    )
    return _status_response()


@router.post("/sync/linkedin/stop", response_model=LinkedInSyncStatusResponse)
def stop_linkedin_sync() -> LinkedInSyncStatusResponse:
    linkedin_sync_runner.stop()
    return _status_response()


@router.post("/sync/linkedin", response_model=LinkedInSyncResponse)
def sync_jobs_from_linkedin_legacy(
    payload: LinkedInSyncRequest | None = None,
    db: Session = Depends(get_db),
) -> LinkedInSyncResponse:
    from app.integrations.linkedin.sync import sync_linkedin_jobs

    options = payload or LinkedInSyncRequest()
    result = sync_linkedin_jobs(
        db,
        keywords=options.keywords,
        location=options.location,
        geo_id=options.geo_id,
        limit=options.limit,
        fetch_details=options.fetch_details,
    )

    if result.blocked:
        message = "LinkedIn blocked the sync. Try again later."
    elif result.stopped:
        message = f"Stopped. Imported {result.imported}, skipped {result.skipped}."
    elif result.imported == 0 and result.skipped == 0:
        message = result.errors[0] if result.errors else "No jobs imported."
    else:
        message = f"Imported {result.imported} job(s), skipped {result.skipped}."

    if result.errors and not result.blocked:
        message = f"{message} {' '.join(result.errors)}"

    return LinkedInSyncResponse(
        imported=result.imported,
        skipped=result.skipped,
        blocked=result.blocked,
        message=message,
        job_ids=result.job_ids,
    )


@router.get("/{job_id}", response_model=JobPostingResponse)
def get_job(job_id: int, db: Session = Depends(get_db)) -> JobPostingResponse:
    job = job_service.get_job(db, job_id)
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")
    return _to_response(job)


@router.delete("/{job_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_job(job_id: int, db: Session = Depends(get_db)) -> None:
    job = job_service.get_job(db, job_id)
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")
    job_service.delete_job(db, job)
