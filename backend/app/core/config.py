from pydantic import AliasChoices, Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(".env", "../.env"),
        env_file_encoding="utf-8",
        extra="ignore",
        populate_by_name=True,
    )

    database_url: str = (
        "postgresql://postgres:postgres@localhost:5432/career_intelligence"
    )
    cors_origins: list[str] = Field(default=["http://localhost:3000"])
    openai_api_key: str | None = None
    openai_embedding_model: str = "text-embedding-3-small"
    openai_chat_model: str = Field(
        default="gpt-4o-mini",
        validation_alias=AliasChoices(
            "openai_chat_model",
            "OPENAI_CHAT_MODEL",
            "OPENAI_MODEL",
        ),
    )
    embedding_dimensions: int = 1536
    chunk_size: int = 900
    chunk_overlap: int = 150
    rag_top_k: int = 8

    # Sensible defaults — not exposed in .env for this assignment
    app_name: str = "Career Intelligence API"
    debug: bool = True
    api_prefix: str = "/api/v1"
    upload_dir: str = "./data/uploads"
    max_upload_size_mb: int = 10
    allowed_upload_extensions: str = ".pdf,.doc,.docx,.txt"
    seed_mock_jobs: bool = False

    @property
    def max_upload_size_bytes(self) -> int:
        return self.max_upload_size_mb * 1024 * 1024

    @property
    def allowed_extensions(self) -> set[str]:
        return {
            ext.strip().lower()
            for ext in self.allowed_upload_extensions.split(",")
            if ext.strip()
        }

    @property
    def llm_configured(self) -> bool:
        return bool(self.openai_api_key)


settings = Settings()
