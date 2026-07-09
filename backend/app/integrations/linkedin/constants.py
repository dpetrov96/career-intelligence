LINKEDIN_GUEST_BASE = "https://www.linkedin.com/jobs-guest/jobs/api"

LINKEDIN_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    "Referer": "https://www.linkedin.com/jobs/search/",
}

FETCH_DELAY_MS = 2500
MAX_RETRIES = 3

DEFAULT_KEYWORDS = "software engineer"
DEFAULT_LOCATION = "Bulgaria"
DEFAULT_GEO_ID = "105333783"

LINKEDIN_GEO = {
    "Bulgaria": "105333783",
    "Germany": "101282230",
    "Romania": "106670623",
    "France": "105015875",
    "Netherlands": "102890719",
    "United Kingdom": "101165590",
    "Poland": "105072130",
    "Greece": "106006489",
}

DEFAULT_SYNC_LIMIT = 10
MAX_SYNC_LIMIT = 100
SEARCH_PAGE_SIZE = 10

AUTHWALL_MARKERS = ("authwall", "checkpoint", "challengesv2")

EXPIRED_MARKERS = (
    "no longer accepting applications",
    "job you were looking for was not found",
)
