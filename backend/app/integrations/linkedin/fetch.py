import re
import time
from dataclasses import dataclass

import httpx

from app.integrations.linkedin.constants import (
    AUTHWALL_MARKERS,
    FETCH_DELAY_MS,
    LINKEDIN_GUEST_BASE,
    LINKEDIN_HEADERS,
    MAX_RETRIES,
)

JOB_ID_PATTERN = re.compile(
    r"(?:urn:li:jobPosting:|/jobs/view/)(\d+)",
    re.IGNORECASE,
)


@dataclass
class FetchResult:
    status_code: int
    html: str
    blocked: bool = False


def is_blocked_html(html: str, status_code: int) -> bool:
    if status_code in {403, 429, 999}:
        return True
    lowered = html.lower()
    return any(marker in lowered for marker in AUTHWALL_MARKERS)


def fetch_html(path: str, *, delay_before: bool = True) -> FetchResult:
    if delay_before:
        time.sleep(FETCH_DELAY_MS / 1000)

    url = f"{LINKEDIN_GUEST_BASE}/{path.lstrip('/')}"
    last_error: Exception | None = None

    for attempt in range(MAX_RETRIES):
        try:
            with httpx.Client(timeout=30.0, follow_redirects=True) as client:
                response = client.get(url, headers=LINKEDIN_HEADERS)

            html = response.text
            blocked = is_blocked_html(html, response.status_code)

            if blocked and attempt < MAX_RETRIES - 1:
                time.sleep(2 ** (attempt + 1))
                continue

            return FetchResult(
                status_code=response.status_code,
                html=html,
                blocked=blocked,
            )
        except httpx.HTTPError as exc:
            last_error = exc
            time.sleep(2 ** (attempt + 1))

    raise RuntimeError(f"LinkedIn fetch failed for {url}: {last_error}")


def build_search_path(
    keywords: str,
    location: str,
    geo_id: str,
    start: int,
) -> str:
    from urllib.parse import urlencode

    query = urlencode(
        {
            "keywords": keywords,
            "location": location,
            "geoId": geo_id,
            "start": start,
        },
    )
    return f"seeMoreJobPostings/search?{query}"


def linkedin_external_id(numeric_id: str) -> str:
    return f"linkedin-{numeric_id}"


def linkedin_view_url(numeric_id: str) -> str:
    return f"https://www.linkedin.com/jobs/view/{numeric_id}"


def extract_job_ids(html: str) -> list[str]:
    ids = JOB_ID_PATTERN.findall(html)
    seen: set[str] = set()
    ordered: list[str] = []
    for job_id in ids:
        if job_id not in seen:
            seen.add(job_id)
            ordered.append(job_id)
    return ordered
