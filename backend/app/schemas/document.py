from datetime import datetime

from pydantic import BaseModel, Field


class DocumentResponse(BaseModel):
    id: int
    kind: str
    filename: str
    mime_type: str | None
    content_preview: str | None
    created_at: datetime

    model_config = {"from_attributes": True}


class ResumeUploadResponse(BaseModel):
    document: DocumentResponse
    session_id: int
    message: str = "Resume uploaded"


class ResumeSearchSuggestion(BaseModel):
    keywords: str
    keyword_alternatives: list[str] = Field(default_factory=list)
    location: str = "Bulgaria"
    geo_id: str = "105333783"
    limit: int = 15
    headline: str = ""
