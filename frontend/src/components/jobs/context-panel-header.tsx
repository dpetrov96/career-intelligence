"use client";

import { Plus, X } from "lucide-react";

import { JobFilters } from "@/components/jobs/job-filters";
import type { CompanyFilter, TypeFilter } from "@/lib/job-filters";
import type { JobPosting } from "@/lib/jobs";

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
  onClose,
}: ContextPanelHeaderProps) {
  return (
    <header className="shrink-0 space-y-3 border-b border-border px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-5 sm:py-4 sm:pt-4">
      <div className="flex items-start gap-2">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-ml-1 flex size-9 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors active:bg-accent"
          >
            <X className="size-4" strokeWidth={1.75} />
          </button>
        )}

        <div className="flex min-w-0 flex-1 items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-[15px] font-semibold tracking-[-0.02em] text-foreground">
              Open roles
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {isFiltered
                ? `${filteredCount} of ${totalCount} positions`
                : `${totalCount} positions`}
            </p>
          </div>

          <button
            type="button"
            className="inline-flex min-h-9 shrink-0 items-center gap-1 rounded-md border border-border px-2.5 py-1.5 text-[11px] font-medium text-foreground transition-colors active:border-primary/30 active:text-primary"
          >
            <Plus className="size-3.5" strokeWidth={1.75} />
            Add
          </button>
        </div>
      </div>

      <JobFilters
        jobs={jobs}
        typeFilter={typeFilter}
        companyFilter={companyFilter}
        onTypeChange={onTypeChange}
        onCompanyChange={onCompanyChange}
        onClear={onClearFilters}
        isFiltered={isFiltered}
      />
    </header>
  );
}
