from app.services.chunking import chunk_text


def test_chunk_text_returns_empty_for_blank_input() -> None:
    assert chunk_text("") == []
    assert chunk_text("   \n  ") == []


def test_chunk_text_keeps_short_text_as_single_chunk() -> None:
    text = "Senior backend engineer with Python and PostgreSQL."
    assert chunk_text(text) == [text]


def test_chunk_text_splits_long_text_with_overlap() -> None:
    text = "word " * 400
    chunks = chunk_text(text.strip())

    assert len(chunks) > 1
    assert all(len(chunk) <= 900 for chunk in chunks)
