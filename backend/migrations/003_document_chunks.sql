CREATE TABLE IF NOT EXISTS document_chunks (
  id SERIAL PRIMARY KEY,
  document_id INTEGER REFERENCES documents(id) ON DELETE CASCADE,
  job_posting_id INTEGER REFERENCES job_postings(id) ON DELETE CASCADE,
  chunk_index INTEGER NOT NULL DEFAULT 0,
  source_label VARCHAR(255) NOT NULL DEFAULT '',
  content TEXT NOT NULL,
  embedding vector(1536) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT document_chunks_source_check CHECK (
    document_id IS NOT NULL OR job_posting_id IS NOT NULL
  )
);

CREATE INDEX IF NOT EXISTS ix_document_chunks_document_id
  ON document_chunks (document_id);

CREATE INDEX IF NOT EXISTS ix_document_chunks_job_posting_id
  ON document_chunks (job_posting_id);
