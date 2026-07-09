from dataclasses import dataclass, field
from typing import Callable

from sqlalchemy.orm import Session

from app.integrations.linkedin.constants import (
    DEFAULT_GEO_ID,
    DEFAULT_KEYWORDS,
    DEFAULT_LOCATION,
    DEFAULT_SYNC_LIMIT,
    MAX_SYNC_LIMIT,
    SEARCH_PAGE_SIZE,
)
from app.integrations.linkedin.fetch import (
    build_search_path,
    extract_job_ids,
    fetch_html,
    linkedin_external_id,
    linkedin_view_url,
)
from app.integrations.linkedin.parser import (
    LinkedInListing,
    infer_work_type,
    guess_domain,
    parse_detail_html,
    parse_search_html,
    pick_logo_url,
)
from app.models.job_posting import JobPosting
from app.core.config import settings

ProgressCallback = Callable[..., None]
StopCallback = Callable[[], bool]


@dataclass
class LinkedInSyncResult:
    imported: int = 0
    skipped: int = 0
    blocked: bool = False
    errors: list[str] = field(default_factory=list)
    job_ids: list[int] = field(default_factory=list)
    stopped: bool = False


def _emit(on_progress: ProgressCallback | None, **kwargs: object) -> None:
    if on_progress:
        on_progress(**kwargs)


def _collect_job_ids(
    keywords: str,
    location: str,
    geo_id: str,
    limit: int,
    *,
    on_progress: ProgressCallback | None = None,
    should_stop: StopCallback | None = None,
) -> tuple[list[str], dict[str, LinkedInListing], bool, list[str]]:
    errors: list[str] = []
    listing_by_id: dict[str, LinkedInListing] = {}
    job_ids: list[str] = []
    seen: set[str] = set()
    start = 0
    page = 1

    _emit(
        on_progress,
        status="searching",
        phase=f"Searching page {page}…",
        current=0,
        total=limit,
    )

    while len(job_ids) < limit:
        if should_stop and should_stop():
            return job_ids, listing_by_id, False, errors

        search = fetch_html(
            build_search_path(keywords, location, geo_id, start=start),
            delay_before=start > 0,
        )
        if search.blocked:
            return job_ids, listing_by_id, True, errors

        page_ids = extract_job_ids(search.html)
        if not page_ids or len(search.html.strip()) < 200:
            break

        for listing in parse_search_html(search.html, page_ids):
            listing_by_id[listing.linkedin_id] = listing

        for job_id in page_ids:
            if job_id in seen:
                continue
            seen.add(job_id)
            job_ids.append(job_id)
            if len(job_ids) >= limit:
                break

        _emit(
            on_progress,
            status="searching",
            phase=f"Found {len(job_ids)} listings…",
            current=0,
            total=max(len(job_ids), limit),
        )

        if len(page_ids) < SEARCH_PAGE_SIZE:
            break

        start += SEARCH_PAGE_SIZE
        page += 1
        _emit(
            on_progress,
            status="searching",
            phase=f"Searching page {page}…",
            current=0,
            total=limit,
        )

    return job_ids, listing_by_id, False, errors


def sync_linkedin_jobs(
    db: Session,
    *,
    keywords: str = DEFAULT_KEYWORDS,
    location: str = DEFAULT_LOCATION,
    geo_id: str = DEFAULT_GEO_ID,
    limit: int = DEFAULT_SYNC_LIMIT,
    fetch_details: bool = True,
    on_progress: ProgressCallback | None = None,
    should_stop: StopCallback | None = None,
) -> LinkedInSyncResult:
    result = LinkedInSyncResult()
    limit = min(max(limit, 1), MAX_SYNC_LIMIT)

    job_ids, listing_by_id, blocked, search_errors = _collect_job_ids(
        keywords,
        location,
        geo_id,
        limit,
        on_progress=on_progress,
        should_stop=should_stop,
    )
    result.errors.extend(search_errors)

    if should_stop and should_stop():
        result.stopped = True
        return result

    if blocked:
        result.blocked = True
        result.errors.append("LinkedIn blocked the request (authwall or rate limit).")
        return result

    if not job_ids:
        result.errors.append("No job listings found for this search.")
        return result

    total = len(job_ids)
    _emit(
        on_progress,
        status="importing",
        phase="Importing job details…",
        current=0,
        total=total,
    )

    for index, numeric_id in enumerate(job_ids, start=1):
        if should_stop and should_stop():
            result.stopped = True
            break

        external_id = linkedin_external_id(numeric_id)
        existing = (
            db.query(JobPosting)
            .filter(JobPosting.external_id == external_id)
            .first()
        )
        if existing:
            result.skipped += 1
            result.job_ids.append(existing.id)
            listing = listing_by_id.get(numeric_id)
            label = _item_label(listing, numeric_id) if listing else numeric_id
            _emit(
                on_progress,
                status="importing",
                phase="Importing job details…",
                current=index,
                total=total,
                current_item=f"Skipped (exists): {label}",
                imported=result.imported,
                skipped=result.skipped,
            )
            continue

        listing: LinkedInListing = listing_by_id.get(numeric_id) or LinkedInListing(
            linkedin_id=numeric_id,
        )
        preview = _item_label(listing, numeric_id)
        _emit(
            on_progress,
            status="importing",
            phase="Importing job details…",
            current=index,
            total=total,
            current_item=preview,
            imported=result.imported,
            skipped=result.skipped,
        )

        title = listing.title
        company = listing.company
        location_text = listing.location or location
        description_text: str | None = None
        apply_url: str | None = None
        logo_url = listing.logo_url
        domain = guess_domain(None, "")

        if fetch_details:
            detail_fetch = fetch_html(f"jobPosting/{numeric_id}")
            if detail_fetch.blocked:
                result.blocked = True
                result.errors.append(
                    f"Blocked while fetching job {numeric_id}. Partial import saved.",
                )
                break

            detail = parse_detail_html(
                detail_fetch.html,
                numeric_id,
                detail_fetch.status_code,
            )
            if detail.expired:
                result.skipped += 1
                continue

            title = detail.title or title
            company = detail.company or company
            location_text = detail.location or location_text
            description_text = detail.description_text or None
            apply_url = detail.apply_url
            logo_url = pick_logo_url(detail.logo_url, logo_url)
            domain = guess_domain(apply_url, detail.description_html)

        if not title or not company:
            result.skipped += 1
            result.errors.append(f"Could not parse job {numeric_id}.")
            continue

        job = JobPosting(
            title=title[:255],
            company=company[:255],
            domain=(domain or "")[:255],
            location=location_text[:255],
            work_type=infer_work_type(location_text, None),
            description_text=description_text,
            external_id=external_id,
            source="linkedin",
            linkedin_url=linkedin_view_url(numeric_id),
            apply_url=apply_url,
            logo_url=logo_url[:512] if logo_url else None,
        )
        db.add(job)
        db.commit()
        db.refresh(job)

        if settings.llm_configured and fetch_details:
            try:
                from app.services.ingestion_service import ingest_job_posting

                ingest_job_posting(db, job)
            except Exception:
                pass

        result.imported += 1
        result.job_ids.append(job.id)

        _emit(
            on_progress,
            status="importing",
            phase="Importing job details…",
            current=index,
            total=total,
            current_item=f"{title} · {company}",
            imported=result.imported,
            skipped=result.skipped,
        )

    return result


def _item_label(listing: LinkedInListing, numeric_id: str) -> str:
    if listing.title and listing.company:
        return f"{listing.title} · {listing.company}"
    if listing.title:
        return listing.title
    return f"Job {numeric_id}"
