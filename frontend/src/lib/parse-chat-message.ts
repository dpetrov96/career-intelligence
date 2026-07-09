import type { StoredChatMessage } from "@/lib/api/sessions";
import type { ChatMessage, JobMatchChip } from "@/types/chat";

export const MATCH_CHIPS_PREFIX = "__MATCH_CHIPS__:";

export function parseStoredChatMessage(message: StoredChatMessage): ChatMessage {
  if (message.content.startsWith(MATCH_CHIPS_PREFIX)) {
    try {
      const payload = JSON.parse(
        message.content.slice(MATCH_CHIPS_PREFIX.length),
      ) as { jobs?: JobMatchChip[] };

      return {
        id: String(message.id),
        role: message.role,
        type: "job_chips",
        jobs: payload.jobs ?? [],
      };
    } catch {
      return {
        id: String(message.id),
        role: message.role,
        type: "text",
        content: message.content,
      };
    }
  }

  return {
    id: String(message.id),
    role: message.role,
    type: "text",
    content: message.content,
  };
}
