from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=4000)
    session_id: int
    job_id: int | None = None


class ChatResponse(BaseModel):
    reply: str
    job_id: int | None = None
    grounded: bool = False
    sources: list[str] = Field(default_factory=list)
