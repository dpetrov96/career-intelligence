from app.services.retrieval_service import _is_compare_all_query


def test_compare_all_query_detection() -> None:
    assert _is_compare_all_query("Compare all jobs for me")
    assert _is_compare_all_query("Can you compare all imported roles?")
    assert not _is_compare_all_query("What skills am I missing?")
