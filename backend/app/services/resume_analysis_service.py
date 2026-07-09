import json
import re
from dataclasses import dataclass, field

from app.core.config import settings
from app.integrations.linkedin.constants import DEFAULT_GEO_ID, DEFAULT_LOCATION, LINKEDIN_GEO
from app.services.embedding_service import get_client


TITLE_PATTERNS = [
    r"(?i)\b((?:senior|staff|lead|principal|junior)\s+)?(?:software|frontend|backend|full[\s-]?stack|mobile|platform|data|ml|devops|cloud|qa|test)\s+(?:engineer|developer|architect)\b",
    r"(?i)\bproduct manager\b",
    r"(?i)\b(?:engineering|technical)\s+manager\b",
    r"(?i)\bdata scientist\b",
    r"(?i)\b(?:ui|ux)\s+designer\b",
]

CITY_LOCATION_HINTS = [
    ("Sofia", "Bulgaria"),
    ("Plovdiv", "Bulgaria"),
    ("Varna", "Bulgaria"),
    ("Berlin", "Germany"),
    ("Munich", "Germany"),
    ("Bucharest", "Romania"),
    ("Paris", "France"),
    ("Amsterdam", "Netherlands"),
    ("London", "United Kingdom"),
    ("Warsaw", "Poland"),
    ("Athens", "Greece"),
]

DEFAULT_KEYWORD_ALTERNATIVES = [
    "software engineer",
    "frontend developer",
    "full stack developer",
    "backend developer",
]


@dataclass
class ResumeLinkedInSearchProfile:
    keywords: str
    keyword_alternatives: list[str] = field(default_factory=list)
    location: str = DEFAULT_LOCATION
    geo_id: str = DEFAULT_GEO_ID
    headline: str = ""


def _geo_options_text() -> str:
    return "\n".join(f'- "{name}" -> {geo_id}' for name, geo_id in LINKEDIN_GEO.items())


def _resolve_geo(location: str | None, geo_id: str | None) -> tuple[str, str]:
    if geo_id and geo_id in LINKEDIN_GEO.values():
        for name, value in LINKEDIN_GEO.items():
            if value == geo_id:
                return name, value

    if location:
        normalized = location.strip()
        for name, value in LINKEDIN_GEO.items():
            if normalized.lower() == name.lower():
                return name, value
        for name, value in LINKEDIN_GEO.items():
            if name.lower() in normalized.lower() or normalized.lower() in name.lower():
                return name, value

    return DEFAULT_LOCATION, DEFAULT_GEO_ID


def _extract_keywords_heuristic(text: str) -> str:
    for pattern in TITLE_PATTERNS:
        match = re.search(pattern, text)
        if match:
            return " ".join(match.group(0).split()).title()
    return "software engineer"


def _extract_location_heuristic(text: str) -> tuple[str, str]:
    for city, country in CITY_LOCATION_HINTS:
        if re.search(rf"(?i)\b{re.escape(city)}\b", text):
            return _resolve_geo(country, None)

    for country in LINKEDIN_GEO:
        if re.search(rf"(?i)\b{re.escape(country)}\b", text):
            return _resolve_geo(country, None)

    return DEFAULT_LOCATION, DEFAULT_GEO_ID


def _build_headline(keywords: str, location: str) -> str:
    return f"Searching LinkedIn for “{keywords}” roles in {location} based on your CV"


def _normalize_alternatives(
    keywords: str,
    alternatives: list[str] | None,
) -> list[str]:
    seen = {keywords.lower()}
    normalized: list[str] = []
    for item in alternatives or []:
        value = item.strip()
        if not value or value.lower() in seen:
            continue
        seen.add(value.lower())
        normalized.append(value[:80])
        if len(normalized) >= 4:
            break
    return normalized


def _fallback_profile(text: str) -> ResumeLinkedInSearchProfile:
    keywords = _extract_keywords_heuristic(text)
    location, geo_id = _extract_location_heuristic(text)
    alternatives = [
        item
        for item in DEFAULT_KEYWORD_ALTERNATIVES
        if item.lower() != keywords.lower()
    ][:4]
    return ResumeLinkedInSearchProfile(
        keywords=keywords,
        keyword_alternatives=alternatives,
        location=location,
        geo_id=geo_id,
        headline=_build_headline(keywords, location),
    )


def analyze_resume_for_linkedin(content: str | None) -> ResumeLinkedInSearchProfile:
    text = (content or "").strip()
    if not text:
        return _fallback_profile("")

    if settings.llm_configured:
        try:
            client = get_client()
            response = client.chat.completions.create(
                model=settings.openai_chat_model,
                messages=[
                    {
                        "role": "system",
                        "content": f"""You analyze a candidate CV and propose LinkedIn job search parameters.

Return JSON only:
{{
  "keywords": "primary 2-4 word role search phrase",
  "keyword_alternatives": ["related role phrase", "..."],
  "location": "LinkedIn location label",
  "geo_id": "LinkedIn geo id",
  "headline": "One short sentence for the user explaining the planned search"
}}

Rules:
- Infer the best target role from recent experience, skills, and seniority — not just the latest job title
- Infer search location from address, recent employers, and stated preferences
- Prefer the candidate's current country/city when remote is not clearly stated
- If the CV strongly targets remote EU roles, still pick the most likely home market from the CV
- keyword_alternatives: 3-4 closely related search phrases, different from keywords
- geo_id must be one of these options:
{_geo_options_text()}
- headline should mention both role and region, max 120 chars""",
                    },
                    {"role": "user", "content": text[:6000]},
                ],
                temperature=0.2,
                max_tokens=260,
                response_format={"type": "json_object"},
            )
            raw = response.choices[0].message.content or "{}"
            data = json.loads(raw)
            keywords = str(data.get("keywords", "")).strip()
            if not keywords:
                raise ValueError("missing keywords")

            location, geo_id = _resolve_geo(
                str(data.get("location", "")).strip() or None,
                str(data.get("geo_id", "")).strip() or None,
            )
            alternatives = _normalize_alternatives(
                keywords,
                [
                    str(item).strip()
                    for item in data.get("keyword_alternatives", [])
                    if isinstance(item, str)
                ],
            )
            headline = str(data.get("headline", "")).strip() or _build_headline(
                keywords,
                location,
            )

            return ResumeLinkedInSearchProfile(
                keywords=keywords[:80],
                keyword_alternatives=alternatives,
                location=location,
                geo_id=geo_id,
                headline=headline[:160],
            )
        except Exception:
            pass

    return _fallback_profile(text)


def suggest_search_from_resume(content: str | None) -> str:
    return analyze_resume_for_linkedin(content).keywords
