"use client";

import { ContextPanelContent } from "@/components/jobs/context-panel-content";
import type { ResumeSearchSuggestion } from "@/lib/api/documents";
import type { LinkedInSyncStatus } from "@/lib/api/types";
import type { JobPosting } from "@/lib/jobs";

import type { LinkedInSyncParams } from "@/lib/linkedin-sync";

interface RightPanelProps {
  jobs: JobPosting[];
  isLoading: boolean;
  error: string | null;
  onReload: () => void;
  selectedJobId: number | null;
  onSelectJob: (id: number) => void;
  syncStatus: LinkedInSyncStatus;
  isLinkedInRunning: boolean;
  isMatching?: boolean;
  onFindMatches: (suggestion: ResumeSearchSuggestion) => void;
  onStartLinkedIn: (params: LinkedInSyncParams) => void;
  onStopLinkedIn: () => void;
  hasResume: boolean;
  resumeFileName: string | null;
  sessionId: number | null;
  autoFindMatches?: boolean;
  highlightImport?: boolean;
}

export function RightPanel({
  jobs,
  isLoading,
  error,
  onReload,
  selectedJobId,
  onSelectJob,
  syncStatus,
  isLinkedInRunning,
  isMatching = false,
  onFindMatches,
  onStartLinkedIn,
  onStopLinkedIn,
  hasResume,
  resumeFileName,
  sessionId,
  autoFindMatches,
  highlightImport,
}: RightPanelProps) {
  return (
    <aside className="hidden min-h-0 w-[380px] shrink-0 flex-col border-l border-border/80 panel-shell lg:flex xl:w-[420px]">
      <ContextPanelContent
        jobs={jobs}
        isLoading={isLoading}
        error={error}
        onReload={onReload}
        selectedJobId={selectedJobId}
        onSelectJob={onSelectJob}
        syncStatus={syncStatus}
        isLinkedInRunning={isLinkedInRunning}
        isMatching={isMatching}
        onFindMatches={onFindMatches}
        onStartLinkedIn={onStartLinkedIn}
        onStopLinkedIn={onStopLinkedIn}
        hasResume={hasResume}
        resumeFileName={resumeFileName}
        sessionId={sessionId}
        autoFindMatches={autoFindMatches}
        highlightImport={highlightImport}
      />
    </aside>
  );
}
