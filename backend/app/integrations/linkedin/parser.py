import re
from dataclasses import dataclass

from bs4 import BeautifulSoup

from app.integrations.linkedin.constants import EXPIRED_MARKERS
from app.models.job_posting import WorkType


@dataclass
class LinkedInListing:
    linkedin_id: str
    title: str = ""
    company: str = ""
    location: str = ""
    logo_url: str | None = None


@dataclass
class LinkedInJobDetail:
    linkedin_id: str
    title: str = ""
    company: str = ""
    location: str = ""
    description_html: str = ""
    description_text: str = ""
    apply_url: str | None = None
    logo_url: str | None = None
    employment_type: str | None = None
    expired: bool = False


def _text(element) -> str:
    if element is None:
        return ""
    return " ".join(element.get_text(" ", strip=True).split())


def _is_linkedin_ghost(url: str) -> bool:
    return "static.licdn.com/aero-v1/sc/h/" in url


def _image_url(element) -> str | None:
    if element is None:
        return None
    delayed = element.get("data-delayed-url")
    src = element.get("src") or ""
    ghost = element.get("data-ghost-url") or ""

    for candidate in (delayed, src if src and src != ghost else None):
        if candidate and not _is_linkedin_ghost(candidate):
            return candidate
    return None


def pick_logo_url(*candidates: str | None) -> str | None:
    for url in candidates:
        if url and not _is_linkedin_ghost(url):
            return url
    return None


def parse_search_html(html: str, known_ids: list[str]) -> list[LinkedInListing]:
    soup = BeautifulSoup(html, "html.parser")
    listings: list[LinkedInListing] = []

    cards = soup.select(".base-search-card, [data-entity-urn*='jobPosting']")
    if not cards:
        cards = soup.select("li")

    for card in cards:
        raw_id = card.get("data-entity-urn", "") or ""
        match = re.search(r"jobPosting:(\d+)", raw_id)
        if not match:
            href = card.select_one('a[href*="/jobs/view/"]')
            if href and href.get("href"):
                match = re.search(r"/jobs/view/(\d+)", href["href"])
        if not match:
            continue

        linkedin_id = match.group(1)
        if known_ids and linkedin_id not in known_ids:
            continue

        logo = card.select_one("img.artdeco-entity-image")
        logo_url = _image_url(logo)

        listings.append(
            LinkedInListing(
                linkedin_id=linkedin_id,
                title=_text(card.select_one(".base-search-card__title")),
                company=_text(card.select_one(".base-search-card__subtitle")),
                location=_text(card.select_one(".job-search-card__location")),
                logo_url=logo_url,
            ),
        )

    if listings:
        return listings

    return [LinkedInListing(linkedin_id=job_id) for job_id in known_ids]


def parse_detail_html(html: str, linkedin_id: str, status_code: int) -> LinkedInJobDetail:
    lowered = html.lower()
    expired = status_code in {404, 410} or any(m in lowered for m in EXPIRED_MARKERS)

    soup = BeautifulSoup(html, "html.parser")
    title = _text(
        soup.select_one(".top-card-layout__title")
        or soup.select_one(".topcard__title")
        or soup.select_one("h1.topcard__title"),
    )
    company = _text(
        soup.select_one(".topcard__org-name-link")
        or soup.select_one(".top-card-layout__company-name")
        or soup.select_one(".topcard__flavor:not(.topcard__flavor--bullet)")
    )
    location = _text(
        soup.select_one(".topcard__flavor--bullet")
        or soup.select_one(".top-card-layout__bullet"),
    )

    description_node = soup.select_one(".show-more-less-html__markup") or soup.select_one(
        ".description__text",
    )
    description_html = str(description_node) if description_node else ""
    description_text = _text(description_node)

    apply_link = soup.select_one(
        'a[data-tracking-control-name="public_jobs_apply-link-offsite"]',
    ) or soup.select_one(".apply-button")
    apply_url = apply_link.get("href") if apply_link else None

    logo = soup.select_one(".topcard__org-logo-image") or soup.select_one(
        ".artdeco-entity-image",
    )
    logo_url = _image_url(logo)

    employment_type = _criteria_value(soup, "Employment type")

    if not title and not company and not description_text:
        expired = expired or len(html.strip()) < 200

    return LinkedInJobDetail(
        linkedin_id=linkedin_id,
        title=title,
        company=company,
        location=location,
        description_html=description_html,
        description_text=description_text,
        apply_url=apply_url,
        logo_url=logo_url,
        employment_type=employment_type,
        expired=expired,
    )


def _criteria_value(soup: BeautifulSoup, label: str) -> str | None:
    for item in soup.select(".description__job-criteria-item"):
        text = _text(item)
        if label.lower() in text.lower():
            value = item.select_one(".description__job-criteria-text")
            return _text(value) or None
    return None


def infer_work_type(location: str, employment_type: str | None) -> WorkType:
    combined = f"{location} {employment_type or ''}".lower()
    if "remote" in combined:
        return WorkType.REMOTE
    if "hybrid" in combined:
        return WorkType.HYBRID
    if "on-site" in combined or "onsite" in combined:
        return WorkType.ON_SITE
    return WorkType.REMOTE


def guess_domain(apply_url: str | None, description_html: str) -> str:
    if apply_url:
        match = re.search(r"https?://(?:www\.)?([^/]+)", apply_url)
        if match and "linkedin.com" not in match.group(1):
            return match.group(1)

    for url in re.findall(r"https?://[^\s\"'<>]+", description_html):
        if "linkedin.com" in url:
            continue
        match = re.search(r"https?://(?:www\.)?([^/]+)", url)
        if match:
            return match.group(1)

    return ""
