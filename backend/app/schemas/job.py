from pydantic import BaseModel, Field

from app.models.job_posting import WorkType


class JobPostingCreate(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    company: str = Field(min_length=1, max_length=255)
    domain: str = Field(default="", max_length=255)
    location: str = Field(default="", max_length=255)
    type: WorkType = WorkType.REMOTE
    description_text: str | None = None


class JobPostingResponse(BaseModel):
    id: int
    title: str
    company: str
    domain: str
    location: str
    type: WorkType
    source: str | None = None
    linkedin_url: str | None = None
    logo_url: str | None = None
    match_score: float | None = None

    model_config = {"from_attributes": True}


class LinkedInSyncRequest(BaseModel):
    keywords: str = Field(default="software engineer", min_length=1, max_length=120)
    location: str = Field(default="Bulgaria", min_length=1, max_length=120)
    geo_id: str = Field(default="105333783", min_length=1, max_length=32)
    limit: int = Field(default=10, ge=1, le=100)
    fetch_details: bool = True


class LinkedInSyncResponse(BaseModel):
    imported: int
    skipped: int
    blocked: bool
    message: str
    job_ids: list[int] = Field(default_factory=list)


class LinkedInSyncStatusResponse(BaseModel):
    sync_id: str | None = None
    status: str = "idle"
    keywords: str | None = None
    location: str | None = None
    geo_id: str | None = None
    limit: int | None = None
    phase: str | None = None
    current: int = 0
    total: int = 0
    imported: int = 0
    skipped: int = 0
    current_item: str | None = None
    message: str | None = None
    blocked: bool = False
    running: bool = False
    job_ids: list[int] = Field(default_factory=list)
