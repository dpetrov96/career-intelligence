"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";

import { JobFilters } from "@/components/jobs/job-filters";
import { LinkedInIcon } from "@/components/jobs/linkedin-sync-button";
import { fetchResumeSearchSuggestions } from "@/lib/api/documents";
import type { ResumeSearchSuggestion } from "@/lib/api/documents";
import type { CompanyFilter, TypeFilter } from "@/lib/job-filters";
import type { JobPosting } from "@/lib/jobs";
import { DEFAULT_LINKEDIN_SYNC, type LinkedInSyncParams } from "@/lib/linkedin-sync";
import { cn } from "@/lib/utils";

interface ContextPanelHeaderProps {
  totalCount: number;
  filteredCount: number;
  isFiltered: boolean;
  jobs: JobPosting[];
  typeFilter: TypeFilter;
  companyFilter: CompanyFilter;
  onTypeChange: (value: TypeFilter) => void;
  onCompanyChange: (value: CompanyFilter) => void;
  onClearFilters: () => void;
  onClose?: () => void;
  isLinkedInRunning?: boolean;
  isMatching?: boolean;
  onFindMatches?: (suggestion: ResumeSearchSuggestion) => void;
  onStartLinkedIn?: (params: LinkedInSyncParams) => void;
  sessionId?: number | null;
  hasResume?: boolean;
}

export function ContextPanelHeader({
  totalCount,
  filteredCount,
  isFiltered,
  jobs,
  typeFilter,
  companyFilter,
  onTypeChange,
  onCompanyChange,
  onClearFilters,
  isLinkedInRunning = false,
  isMatching = false,
  onFindMatches,
  onStartLinkedIn,
  sessionId = null,
  hasResume = false,
}: ContextPanelHeaderProps) {
  const [isAnalyzingCv, setIsAnalyzingCv] = useState(false);

  async function handleScrapeMore() {
    if (isLinkedInRunning || isMatching || isAnalyzingCv) return;

    if (hasResume && sessionId != null && onFindMatches) {
      setIsAnalyzingCv(true);
      try {
        const suggestion = await fetchResumeSearchSuggestions(sessionId);
        onFindMatches(suggestion);
      } finally {
        setIsAnalyzingCv(false);
      }
      return;
    }

    onStartLinkedIn?.(DEFAULT_LINKEDIN_SYNC);
  }

  const panelBusy = isLinkedInRunning || isMatching || isAnalyzingCv;
  const canScrape = Boolean(
    onStartLinkedIn || (hasResume && sessionId != null && onFindMatches),
  );
  const hasMatches =
    totalCount > 0 && !isLinkedInRunning && !isMatching;

  return (
    <header className="shrink-0 space-y-3 border-b border-border px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-5 sm:py-4 sm:pt-4">
      <div className="flex items-start gap-2">
        <div className="flex min-w-0 flex-1 items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-[15px] font-semibold tracking-[-0.02em] text-foreground">
              {hasMatches ? "Recommended matches" : "Open roles"}
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {isLinkedInRunning
                ? "Scraping in progress — follow progress in chat"
                : isMatching
                  ? "Ranking imported roles against your CV"
                  : totalCount === 0
                  ? hasResume
                    ? "Matches appear here after analysis"
                    : "Scrape LinkedIn or upload a CV to match"
                  : isFiltered
                    ? `${filteredCount} of ${totalCount} roles`
                    : hasResume
                      ? `${totalCount} roles ranked by fit`
                      : `${totalCount} scraped roles`}
            </p>
          </div>

          {canScrape && (
            <button
              type="button"
              onClick={() => void handleScrapeMore()}
              disabled={panelBusy}
              className={cn(
                "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold transition-all",
                "bg-primary text-primary-foreground shadow-[0_4px_14px_rgb(37_99_235_/_0.3)] hover:brightness-105 disabled:opacity-60",
              )}
            >
              {panelBusy ? (
                <Loader2 className="size-3.5 animate-spin" strokeWidth={2} />
              ) : (
                <LinkedInIcon className="size-3.5" />
              )}
              {isAnalyzingCv
                ? "Analyzing CV…"
                : totalCount === 0
                  ? "Scrape LinkedIn"
                  : "Scrape more"}
            </button>
          )}
        </div>
      </div>

      {hasMatches && (
        <JobFilters
          jobs={jobs}
          typeFilter={typeFilter}
          companyFilter={companyFilter}
          onTypeChange={onTypeChange}
          onCompanyChange={onCompanyChange}
          onClear={onClearFilters}
          isFiltered={isFiltered}
        />
      )}
    </header>
  );
}
