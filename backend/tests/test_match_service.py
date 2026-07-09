import pytest

from app.services.match_service import _cosine_similarity, _mean_vector


def test_mean_vector_averages_components() -> None:
    result = _mean_vector([[1.0, 0.0], [3.0, 2.0]])
    assert result == [2.0, 1.0]


def test_cosine_similarity_for_identical_vectors() -> None:
    vector = [0.6, 0.8]
    assert _cosine_similarity(vector, vector) == pytest.approx(1.0)


def test_cosine_similarity_for_orthogonal_vectors() -> None:
    assert _cosine_similarity([1.0, 0.0], [0.0, 1.0]) == 0.0
