"use client";

import { X } from "lucide-react";

import { ContextPanelHeader } from "@/components/jobs/context-panel-header";
import { JobPostingList } from "@/components/jobs/job-posting-list";
import { JobsEmptyState } from "@/components/jobs/jobs-empty-state";
import { JobsPanelEmptyState } from "@/components/jobs/jobs-panel-empty-state";
import { RolesPanelPlaceholder } from "@/components/jobs/roles-panel-placeholder";
import { useJobFilters } from "@/hooks/use-job-filters";
import type { ResumeSearchSuggestion } from "@/lib/api/documents";
import type { LinkedInSyncStatus } from "@/lib/api/types";
import type { JobPosting } from "@/lib/jobs";
import type { LinkedInSyncParams } from "@/lib/linkedin-sync";

import { cn } from "@/lib/utils";

interface ContextPanelContentProps {
  jobs: JobPosting[];
  isLoading: boolean;
  error: string | null;
  onReload: () => void;
  selectedJobId: number | null;
  onSelectJob: (id: number) => void;
  onJobSelected?: () => void;
  onClose?: () => void;
  className?: string;
  syncStatus: LinkedInSyncStatus;
  isLinkedInRunning: boolean;
  isMatching?: boolean;
  onStopLinkedIn?: () => void;
  highlightImport?: boolean;
  hasResume?: boolean;
  resumeFileName?: string | null;
  sessionId?: number | null;
  onFindMatches?: (suggestion: ResumeSearchSuggestion) => void;
  onStartLinkedIn?: (params: LinkedInSyncParams) => void;
  autoFindMatches?: boolean;
}

export function ContextPanelContent({
  jobs,
  isLoading,
  error,
  onReload,
  selectedJobId,
  onSelectJob,
  onJobSelected,
  onClose,
  className,
  syncStatus,
  isLinkedInRunning,
  isMatching = false,
  onStopLinkedIn,
  highlightImport,
  hasResume = false,
  resumeFileName = null,
  sessionId = null,
  onFindMatches,
  onStartLinkedIn,
  autoFindMatches = false,
}: ContextPanelContentProps) {
  const {
    typeFilter,
    companyFilter,
    setTypeFilter,
    setCompanyFilter,
    filteredJobs,
    isFiltered,
    clearFilters,
  } = useJobFilters(jobs);

  const showJobs =
    !isLinkedInRunning && !isMatching && filteredJobs.length > 0;
  const panelIsEmpty =
    !isLoading &&
    !error &&
    jobs.length === 0 &&
    !isLinkedInRunning &&
    !isMatching;
  const panelBusy = isLinkedInRunning || isMatching;

  function handleSelectJob(id: number) {
    onSelectJob(id);
    onJobSelected?.();
  }

  return (
    <div
      className={cn(
        "flex min-h-0 flex-1 flex-col",
        highlightImport && jobs.length === 0 && "ring-2 ring-inset ring-primary/25",
        className,
      )}
    >
      {onClose && (
        <div className="flex justify-end px-4 pt-[max(0.75rem,env(safe-area-inset-top))] sm:pt-3 lg:hidden">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors active:bg-accent"
          >
            <X className="size-4" strokeWidth={1.75} />
          </button>
        </div>
      )}

      <ContextPanelHeader
        totalCount={panelBusy ? 0 : jobs.length}
        filteredCount={panelBusy ? 0 : filteredJobs.length}
        isFiltered={isFiltered}
        jobs={jobs}
        typeFilter={typeFilter}
        companyFilter={companyFilter}
        onTypeChange={setTypeFilter}
        onCompanyChange={setCompanyFilter}
        onClearFilters={clearFilters}
        sessionId={sessionId}
        hasResume={hasResume}
        isLinkedInRunning={isLinkedInRunning}
        isMatching={isMatching}
        onFindMatches={onFindMatches}
        onStartLinkedIn={onStartLinkedIn}
      />

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch]">
        {isLinkedInRunning ? (
          <div className="flex min-h-[220px] flex-col items-center justify-center px-6 py-10 text-center">
            <p className="text-sm font-medium text-foreground">
              Scraping open roles
            </p>
            <p className="mt-2 max-w-[240px] text-xs leading-relaxed text-muted-foreground">
              Recommended roles will appear here once scraping and fit scoring
              finish. Progress is shown in chat.
            </p>
          </div>
        ) : isMatching ? (
          <div className="flex min-h-[220px] flex-col items-center justify-center px-6 py-10 text-center">
            <p className="text-sm font-medium text-foreground">
              Ranking imported roles
            </p>
            <p className="mt-2 max-w-[240px] text-xs leading-relaxed text-muted-foreground">
              Calculating fit scores against your CV. Matches appear here in a
              moment.
            </p>
          </div>
        ) : isLoading ? (
          <p className="px-5 py-8 text-center text-xs text-muted-foreground">
            Loading positions…
          </p>
        ) : error ? (
          <div className="space-y-3 px-5 py-8 text-center">
            <p className="text-xs text-muted-foreground">{error}</p>
            <button
              type="button"
              onClick={onReload}
              className="text-xs font-medium text-primary"
            >
              Retry
            </button>
          </div>
        ) : showJobs ? (
          <JobPostingList
            jobs={filteredJobs}
            selectedJobId={selectedJobId}
            onSelectJob={handleSelectJob}
          />
        ) : jobs.length > 0 ? (
          <JobsEmptyState />
        ) : panelIsEmpty && hasResume ? (
          <RolesPanelPlaceholder hasResume />
        ) : panelIsEmpty && onStartLinkedIn && onStopLinkedIn ? (
          <JobsPanelEmptyState
            hasResume={hasResume}
            resumeFileName={resumeFileName}
            sessionId={sessionId}
            syncStatus={syncStatus}
            isRunning={isLinkedInRunning}
            onStartLinkedIn={onStartLinkedIn}
            onStop={onStopLinkedIn}
          />
        ) : null}
      </div>
    </div>
  );
}
