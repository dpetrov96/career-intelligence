"use client";

import { ContextPanelHeader } from "@/components/jobs/context-panel-header";
import { JobPostingList } from "@/components/jobs/job-posting-list";
import { JobsEmptyState } from "@/components/jobs/jobs-empty-state";
import { useJobFilters } from "@/hooks/use-job-filters";
import { MOCK_JOBS } from "@/lib/jobs";
import { cn } from "@/lib/utils";

interface ContextPanelContentProps {
  selectedJobId: number | null;
  onSelectJob: (id: number) => void;
  onJobSelected?: () => void;
  onClose?: () => void;
  className?: string;
}

export function ContextPanelContent({
  selectedJobId,
  onSelectJob,
  onJobSelected,
  onClose,
  className,
}: ContextPanelContentProps) {
  const {
    typeFilter,
    companyFilter,
    setTypeFilter,
    setCompanyFilter,
    filteredJobs,
    isFiltered,
    clearFilters,
  } = useJobFilters(MOCK_JOBS);

  function handleSelectJob(id: number) {
    onSelectJob(id);
    onJobSelected?.();
  }

  return (
    <div className={cn("flex min-h-0 flex-1 flex-col bg-surface", className)}>
      <ContextPanelHeader
        totalCount={MOCK_JOBS.length}
        filteredCount={filteredJobs.length}
        isFiltered={isFiltered}
        jobs={MOCK_JOBS}
        typeFilter={typeFilter}
        companyFilter={companyFilter}
        onTypeChange={setTypeFilter}
        onCompanyChange={setCompanyFilter}
        onClearFilters={clearFilters}
        onClose={onClose}
      />

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch]">
        {filteredJobs.length > 0 ? (
          <JobPostingList
            jobs={filteredJobs}
            selectedJobId={selectedJobId}
            onSelectJob={handleSelectJob}
          />
        ) : (
          <JobsEmptyState />
        )}
      </div>
    </div>
  );
}
