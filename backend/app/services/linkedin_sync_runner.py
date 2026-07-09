import enum
import threading
import uuid
from dataclasses import dataclass, field
from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.integrations.linkedin.constants import (
    DEFAULT_GEO_ID,
    DEFAULT_KEYWORDS,
    DEFAULT_LOCATION,
    DEFAULT_SYNC_LIMIT,
    MAX_SYNC_LIMIT,
)
from app.integrations.linkedin.sync import sync_linkedin_jobs


class SyncStatus(str, enum.Enum):
    IDLE = "idle"
    SEARCHING = "searching"
    IMPORTING = "importing"
    COMPLETED = "completed"
    STOPPED = "stopped"
    BLOCKED = "blocked"
    FAILED = "failed"


_RUNNING = {SyncStatus.SEARCHING, SyncStatus.IMPORTING}


@dataclass
class LinkedInSyncState:
    sync_id: str
    status: SyncStatus = SyncStatus.IDLE
    keywords: str = DEFAULT_KEYWORDS
    location: str = DEFAULT_LOCATION
    geo_id: str = DEFAULT_GEO_ID
    limit: int = DEFAULT_SYNC_LIMIT
    phase: str = ""
    current: int = 0
    total: int = 0
    imported: int = 0
    skipped: int = 0
    current_item: str | None = None
    message: str | None = None
    blocked: bool = False
    job_ids: list[int] = field(default_factory=list)
    started_at: str | None = None
    finished_at: str | None = None


class LinkedInSyncRunner:
    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._cancel = threading.Event()
        self._thread: threading.Thread | None = None
        self._state = LinkedInSyncState(sync_id="")

    def get_state(self) -> LinkedInSyncState | None:
        with self._lock:
            if not self._state.sync_id:
                return None
            return LinkedInSyncState(**self._state.__dict__)

    def is_running(self) -> bool:
        with self._lock:
            return self._state.status in _RUNNING

    def start(
        self,
        *,
        keywords: str,
        location: str,
        geo_id: str,
        limit: int,
    ) -> LinkedInSyncState:
        with self._lock:
            if self._state.status in _RUNNING:
                return LinkedInSyncState(**self._state.__dict__)

            self._cancel.clear()
            sync_id = str(uuid.uuid4())
            self._state = LinkedInSyncState(
                sync_id=sync_id,
                status=SyncStatus.SEARCHING,
                keywords=keywords,
                location=location,
                geo_id=geo_id,
                limit=min(max(limit, 1), MAX_SYNC_LIMIT),
                phase="Searching LinkedIn listings…",
                started_at=datetime.now(timezone.utc).isoformat(),
            )

            self._thread = threading.Thread(
                target=self._run,
                args=(keywords, location, geo_id, self._state.limit),
                daemon=True,
            )
            self._thread.start()
            return LinkedInSyncState(**self._state.__dict__)

    def stop(self) -> LinkedInSyncState | None:
        with self._lock:
            if not self._state.sync_id:
                return None
            if self._state.status in _RUNNING:
                self._cancel.set()
                self._state.status = SyncStatus.STOPPED
                self._state.phase = "Stopping…"
                self._state.message = "Sync stopped by user."
                self._state.finished_at = datetime.now(timezone.utc).isoformat()
            return LinkedInSyncState(**self._state.__dict__)

    def _update(self, **kwargs: object) -> None:
        with self._lock:
            for key, value in kwargs.items():
                setattr(self._state, key, value)

    def _on_progress(self, **kwargs: object) -> None:
        if self._cancel.is_set():
            return

        mapped: dict[str, object] = {}
        status = kwargs.get("status")
        if status == "searching":
            mapped["status"] = SyncStatus.SEARCHING
        elif status == "importing":
            mapped["status"] = SyncStatus.IMPORTING

        for key in (
            "phase",
            "current",
            "total",
            "current_item",
            "imported",
            "skipped",
        ):
            if key in kwargs:
                mapped[key] = kwargs[key]

        if mapped:
            self._update(**mapped)

    def _run(
        self,
        keywords: str,
        location: str,
        geo_id: str,
        limit: int,
    ) -> None:
        db: Session = SessionLocal()
        try:
            result = sync_linkedin_jobs(
                db,
                keywords=keywords,
                location=location,
                geo_id=geo_id,
                limit=limit,
                should_stop=self._cancel.is_set,
                on_progress=self._on_progress,
            )

            if self._cancel.is_set() or result.stopped:
                self._update(
                    status=SyncStatus.STOPPED,
                    phase="Stopped",
                    message=f"Stopped. Imported {result.imported}, skipped {result.skipped}.",
                    imported=result.imported,
                    skipped=result.skipped,
                    job_ids=result.job_ids,
                    finished_at=datetime.now(timezone.utc).isoformat(),
                )
                return

            if result.blocked:
                self._update(
                    status=SyncStatus.BLOCKED,
                    blocked=True,
                    phase="Blocked",
                    message="LinkedIn blocked the sync. Try again later.",
                    imported=result.imported,
                    skipped=result.skipped,
                    job_ids=result.job_ids,
                    finished_at=datetime.now(timezone.utc).isoformat(),
                )
                return

            if result.imported == 0 and result.skipped == 0:
                message = result.errors[0] if result.errors else "No jobs imported."
            else:
                message = f"Imported {result.imported} job(s), skipped {result.skipped}."

            self._update(
                status=SyncStatus.COMPLETED,
                phase="Done",
                message=message,
                imported=result.imported,
                skipped=result.skipped,
                job_ids=result.job_ids,
                current=result.imported + result.skipped,
                finished_at=datetime.now(timezone.utc).isoformat(),
            )
        except Exception as exc:
            self._update(
                status=SyncStatus.FAILED,
                phase="Failed",
                message=str(exc),
                finished_at=datetime.now(timezone.utc).isoformat(),
            )
        finally:
            db.close()


linkedin_sync_runner = LinkedInSyncRunner()
