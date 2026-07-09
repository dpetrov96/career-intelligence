import { apiFetch } from "@/lib/api/client";
import type { ChatResult } from "@/lib/api/types";

export async function sendChatMessage(payload: {
  message: string;
  session_id: number;
  job_id?: number | null;
}): Promise<ChatResult> {
  return apiFetch<ChatResult>("/chat", {
    method: "POST",
    body: JSON.stringify({
      message: payload.message,
      session_id: payload.session_id,
      job_id: payload.job_id ?? null,
    }),
  });
}
