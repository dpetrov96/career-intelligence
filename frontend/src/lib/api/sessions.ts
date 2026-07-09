import { apiFetch } from "@/lib/api/client";

export interface ChatSession {
  id: number;
  document_id: number;
  title: string;
  resume_filename: string;
  created_at: string;
  updated_at: string;
  message_count: number;
}

export interface StoredChatMessage {
  id: number;
  role: "user" | "assistant";
  content: string;
  job_posting_id: number | null;
  created_at: string;
}

export async function fetchSessions(): Promise<ChatSession[]> {
  return apiFetch<ChatSession[]>("/sessions");
}

export async function fetchSessionMessages(
  sessionId: number,
): Promise<StoredChatMessage[]> {
  return apiFetch<StoredChatMessage[]>(`/sessions/${sessionId}/messages`);
}

export async function seedSessionWelcome(
  sessionId: number,
  params: {
    job_id: number;
    match_count: number;
    match_score?: number | null;
  },
): Promise<{ messages: StoredChatMessage[] }> {
  const query = new URLSearchParams({
    job_id: String(params.job_id),
    match_count: String(params.match_count),
  });
  if (params.match_score != null) {
    query.set("match_score", String(params.match_score));
  }

  return apiFetch<{ messages: StoredChatMessage[] }>(
    `/sessions/${sessionId}/welcome?${query.toString()}`,
    { method: "POST" },
  );
}

export interface SuggestedPromptsResponse {
  prompts: string[];
}

export async function fetchSuggestedPrompts(
  sessionId: number,
  jobId: number | null,
): Promise<SuggestedPromptsResponse> {
  const query = jobId != null ? `?job_id=${jobId}` : "";
  return apiFetch<SuggestedPromptsResponse>(
    `/sessions/${sessionId}/suggested-prompts${query}`,
  );
}
