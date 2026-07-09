export type WorkType = "Remote" | "Hybrid" | "On-site";

export interface JobPosting {
  id: number;
  title: string;
  company: string;
  domain: string;
  location: string;
  type: WorkType;
  source?: string | null;
  linkedin_url?: string | null;
  logo_url?: string | null;
  match_score?: number | null;
}

export interface LinkedInSyncResult {
  imported: number;
  skipped: number;
  blocked: boolean;
  message: string;
  job_ids: number[];
}

export interface LinkedInSyncStatus {
  sync_id: string | null;
  status: string;
  keywords: string | null;
  location: string | null;
  geo_id: string | null;
  limit: number | null;
  phase: string | null;
  current: number;
  total: number;
  imported: number;
  skipped: number;
  current_item: string | null;
  message: string | null;
  blocked: boolean;
  running: boolean;
  job_ids: number[];
}

export interface DocumentRecord {
  id: number;
  kind: string;
  filename: string;
  mime_type: string | null;
  content_preview: string | null;
  created_at: string;
}

export interface ResumeUploadResult {
  document: DocumentRecord;
  session_id: number;
  message: string;
}

export interface ChatResult {
  reply: string;
  job_id: number | null;
  grounded: boolean;
  sources: string[];
}
