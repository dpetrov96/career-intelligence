import { apiFetch } from "@/lib/api/client";
import type { JobPosting, LinkedInSyncStatus } from "@/lib/api/types";
import type { LinkedInSyncParams } from "@/lib/linkedin-sync";

export async function fetchJobs(sessionId?: number | null): Promise<JobPosting[]> {
  const query =
    sessionId != null ? `?session_id=${sessionId}` : "";
  return apiFetch<JobPosting[]>(`/jobs${query}`);
}

export async function fetchLinkedInSyncStatus(): Promise<LinkedInSyncStatus> {
  return apiFetch<LinkedInSyncStatus>("/jobs/sync/linkedin/status");
}

export async function startLinkedInSync(
  params: LinkedInSyncParams,
): Promise<LinkedInSyncStatus> {
  return apiFetch<LinkedInSyncStatus>("/jobs/sync/linkedin/start", {
    method: "POST",
    body: JSON.stringify({
      keywords: params.keywords,
      location: params.location,
      geo_id: params.geo_id,
      limit: params.limit,
    }),
  });
}

export async function stopLinkedInSync(): Promise<LinkedInSyncStatus> {
  return apiFetch<LinkedInSyncStatus>("/jobs/sync/linkedin/stop", {
    method: "POST",
  });
}

export async function createJob(
  payload: Omit<JobPosting, "id"> & { description_text?: string },
): Promise<JobPosting> {
  return apiFetch<JobPosting>("/jobs", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
