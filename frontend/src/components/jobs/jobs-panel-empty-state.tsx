"use client";

import { FileUp } from "lucide-react";
import { useEffect, useState } from "react";

import { LinkedInSyncFlow } from "@/components/jobs/linkedin-sync-flow";
import { LinkedInSyncProgress } from "@/components/jobs/linkedin-sync-progress";
import { fetchResumeSearchSuggestions } from "@/lib/api/documents";
import type { LinkedInSyncStatus } from "@/lib/api/types";
import {
  LINKEDIN_KEYWORD_SUGGESTIONS,
  type LinkedInSyncParams,
} from "@/lib/linkedin-sync";

interface JobsPanelEmptyStateProps {
  hasResume: boolean;
  resumeFileName?: string | null;
  sessionId?: number | null;
  syncStatus: LinkedInSyncStatus;
  isRunning: boolean;
  onStartLinkedIn: (params: LinkedInSyncParams) => void;
  onStop: () => void;
}

export function JobsPanelEmptyState({
  hasResume,
  resumeFileName,
  sessionId = null,
  syncStatus,
  isRunning,
  onStartLinkedIn,
  onStop,
}: JobsPanelEmptyStateProps) {
  const [keywordSuggestions, setKeywordSuggestions] = useState<string[]>([
    ...LINKEDIN_KEYWORD_SUGGESTIONS,
  ]);

  useEffect(() => {
    if (!hasResume || sessionId == null) return;

    let cancelled = false;

    void (async () => {
      try {
        const suggestion = await fetchResumeSearchSuggestions(sessionId);
        if (cancelled) return;

        const keywords = [
          suggestion.keywords,
          ...(suggestion.keyword_alternatives ?? []),
        ].filter(Boolean);

        if (keywords.length > 0) {
          setKeywordSuggestions(keywords);
        }
      } catch {
        /* keep defaults */
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [hasResume, sessionId]);

  if (isRunning) {
    return <LinkedInSyncProgress status={syncStatus} onStop={onStop} />;
  }

  return (
    <div className="px-5 py-6 sm:py-8">
      {hasResume ? (
        <div className="mb-5 rounded-xl border border-primary/20 bg-primary/5 px-3.5 py-3 text-left">
          <p className="text-sm font-medium text-foreground">
            CV uploaded{resumeFileName ? `: ${resumeFileName}` : ""}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Fit matching cannot start until open roles are scraped from LinkedIn.
            Import listings below to rank them against your profile.
          </p>
        </div>
      ) : (
        <div className="mb-5 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-accent">
            <FileUp className="size-5 text-muted-foreground" strokeWidth={1.75} />
          </div>
          <h3 className="mt-4 text-[15px] font-semibold tracking-[-0.02em] text-foreground">
            Scrape roles from LinkedIn
          </h3>
          <p className="mx-auto mt-2 max-w-[260px] text-sm leading-relaxed text-muted-foreground">
            Import open positions here. Upload your CV in the chat to unlock fit
            scores and analysis.
          </p>
        </div>
      )}

      <LinkedInSyncFlow
        variant="embedded"
        isRunning={isRunning}
        onStart={onStartLinkedIn}
        keywordSuggestions={keywordSuggestions}
      />

      {syncStatus.message && syncStatus.status !== "idle" && (
        <p className="mt-4 text-[11px] leading-relaxed text-muted-foreground">
          {syncStatus.message}
        </p>
      )}
    </div>
  );
}
