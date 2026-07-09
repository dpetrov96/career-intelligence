"use client";

import { FindMatchingRoles } from "@/components/jobs/find-matching-roles";
import type { ResumeSearchSuggestion } from "@/lib/api/documents";
import type { LinkedInSyncStatus } from "@/lib/api/types";

interface JobsImportEmptyStateProps {
  sessionId: number;
  syncStatus: LinkedInSyncStatus;
  isRunning: boolean;
  onFindMatches: (suggestion: ResumeSearchSuggestion) => void;
  onStop: () => void;
  autoStart?: boolean;
}

export function JobsImportEmptyState({
  sessionId,
  syncStatus,
  isRunning,
  onFindMatches,
  onStop,
  autoStart,
}: JobsImportEmptyStateProps) {
  return (
    <FindMatchingRoles
      sessionId={sessionId}
      isRunning={isRunning}
      syncStatus={syncStatus}
      onFindMatches={onFindMatches}
      onStop={onStop}
      autoStart={autoStart}
    />
  );
}
