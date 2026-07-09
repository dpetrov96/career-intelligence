from collections.abc import Generator
from unittest.mock import MagicMock

import pytest
from fastapi.testclient import TestClient

from app.api.deps import get_db
from app.main import app


@pytest.fixture
def client() -> Generator[TestClient, None, None]:
    mock_db = MagicMock()
    mock_db.execute.return_value = None

    def override_get_db() -> Generator[MagicMock, None, None]:
        yield mock_db

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
