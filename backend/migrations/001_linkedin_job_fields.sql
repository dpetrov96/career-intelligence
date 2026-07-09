-- Add LinkedIn fields to job_postings (safe to re-run)
ALTER TABLE job_postings ADD COLUMN IF NOT EXISTS external_id VARCHAR(64);
ALTER TABLE job_postings ADD COLUMN IF NOT EXISTS source VARCHAR(32);
ALTER TABLE job_postings ADD COLUMN IF NOT EXISTS linkedin_url VARCHAR(512);
ALTER TABLE job_postings ADD COLUMN IF NOT EXISTS apply_url VARCHAR(512);

CREATE UNIQUE INDEX IF NOT EXISTS ix_job_postings_external_id
  ON job_postings (external_id)
  WHERE external_id IS NOT NULL;
