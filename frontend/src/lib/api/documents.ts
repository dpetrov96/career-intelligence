import { apiFetch, ApiError } from "@/lib/api/client";
import type { DocumentRecord, ResumeUploadResult } from "@/lib/api/types";

export interface ResumeSearchSuggestion {
  keywords: string;
  keyword_alternatives?: string[];
  location: string;
  geo_id: string;
  limit: number;
  headline: string;
}

function withSessionQuery(path: string, sessionId?: number | null): string {
  if (sessionId == null) return path;
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}session_id=${sessionId}`;
}

export async function fetchResume(
  sessionId?: number | null,
): Promise<DocumentRecord | null> {
  try {
    return await apiFetch<DocumentRecord>(
      withSessionQuery("/documents/resume", sessionId),
    );
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }
    throw error;
  }
}

export async function uploadResume(file: File): Promise<ResumeUploadResult> {
  const formData = new FormData();
  formData.append("file", file);

  return apiFetch<ResumeUploadResult>("/documents/resume", {
    method: "POST",
    body: formData,
  });
}

export async function fetchResumeSearchSuggestions(
  sessionId: number,
): Promise<ResumeSearchSuggestion> {
  return apiFetch<ResumeSearchSuggestion>(
    withSessionQuery("/documents/resume/suggestions", sessionId),
  );
}
