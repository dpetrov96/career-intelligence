"use client";

import { useEffect, useState } from "react";

import { fetchSuggestedPrompts } from "@/lib/api/sessions";

const FALLBACK_PROMPTS = [
  "What skill gaps do I have for this role?",
  "How does my experience align with the requirements?",
  "Help me prepare for an interview at this company",
  "Compare all jobs and rank my best fits",
];

export function useSuggestedPrompts(
  sessionId: number | null,
  selectedJobId: number | null,
  messageCount: number,
) {
  const [prompts, setPrompts] = useState<string[]>(FALLBACK_PROMPTS);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (sessionId === null) {
      setPrompts(FALLBACK_PROMPTS);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    void (async () => {
      try {
        const result = await fetchSuggestedPrompts(sessionId, selectedJobId);
        if (!cancelled && result.prompts.length > 0) {
          setPrompts(result.prompts);
        }
      } catch {
        if (!cancelled) setPrompts(FALLBACK_PROMPTS);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [sessionId, selectedJobId, messageCount]);

  return { prompts, isLoading };
}
