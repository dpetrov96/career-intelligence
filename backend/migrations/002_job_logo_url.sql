-- Add company logo URL from LinkedIn scrape
ALTER TABLE job_postings ADD COLUMN IF NOT EXISTS logo_url VARCHAR(512);
