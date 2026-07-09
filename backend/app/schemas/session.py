from datetime import datetime

from pydantic import BaseModel, Field


class ChatSessionResponse(BaseModel):
    id: int
    document_id: int
    title: str
    resume_filename: str
    created_at: datetime
    updated_at: datetime
    message_count: int = 0

    model_config = {"from_attributes": True}


class ChatMessageResponse(BaseModel):
    id: int
    role: str
    content: str
    job_posting_id: int | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


class WelcomeSeedResponse(BaseModel):
    messages: list[ChatMessageResponse] = Field(default_factory=list)


class SuggestedPromptsResponse(BaseModel):
    prompts: list[str] = Field(default_factory=list)
