from pathlib import Path


def extract_text(path: Path, mime_type: str | None = None) -> str:
    suffix = path.suffix.lower()

    if suffix == ".txt":
        return path.read_text(encoding="utf-8", errors="ignore").strip()

    if suffix == ".pdf":
        from pypdf import PdfReader

        reader = PdfReader(str(path))
        pages = [page.extract_text() or "" for page in reader.pages]
        return "\n".join(pages).strip()

    if suffix in {".doc", ".docx"}:
        from docx import Document

        document = Document(str(path))
        return "\n".join(p.text for p in document.paragraphs if p.text).strip()

    raise ValueError(f"Unsupported file type: {suffix}")
