export type ChatRole = "assistant" | "user";

export interface JobMatchChip {
  id: number;
  title: string;
  company: string;
  domain: string;
  logo_url?: string | null;
  match_score?: number | null;
}

export type ChatMessage =
  | {
      id: string;
      role: ChatRole;
      type: "text";
      content: string;
    }
  | {
      id: string;
      role: ChatRole;
      type: "job_chips";
      jobs: JobMatchChip[];
    };
