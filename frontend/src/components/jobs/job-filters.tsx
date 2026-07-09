"use client";

import { X } from "lucide-react";

import { FilterMenu } from "@/components/jobs/filter-menu";
import {
  type CompanyFilter,
  getUniqueCompanies,
  TYPE_FILTER_OPTIONS,
  type TypeFilter,
} from "@/lib/job-filters";
import type { JobPosting } from "@/lib/jobs";
import { cn } from "@/lib/utils";

interface JobFiltersProps {
  jobs: JobPosting[];
  typeFilter: TypeFilter;
  companyFilter: CompanyFilter;
  onTypeChange: (value: TypeFilter) => void;
  onCompanyChange: (value: CompanyFilter) => void;
  onClear: () => void;
  isFiltered: boolean;
  className?: string;
}

export function JobFilters({
  jobs,
  typeFilter,
  companyFilter,
  onTypeChange,
  onCompanyChange,
  onClear,
  isFiltered,
  className,
}: JobFiltersProps) {
  const companies = getUniqueCompanies(jobs);

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {TYPE_FILTER_OPTIONS.map(({ value, label }) => {
          const active = typeFilter === value;
          return (
            <button
              key={value}
              type="button"
              onClick={() => onTypeChange(value)}
              className={cn(
                "shrink-0 rounded-full border px-3 py-2 text-[11px] font-medium transition-colors active:scale-[0.98] sm:py-1",
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground active:border-primary/30 active:text-foreground",
              )}
            >
              {label}
            </button>
          );
        })}

        <span aria-hidden className="mx-0.5 h-4 w-px shrink-0 bg-border" />

        <FilterMenu
          label="Company"
          value={companyFilter}
          onChange={onCompanyChange}
          align="right"
          options={[
            { value: "all", label: "All companies" },
            ...companies.map((company) => ({
              value: company,
              label: company,
            })),
          ]}
        />
      </div>

      {isFiltered && (
        <button
          type="button"
          onClick={onClear}
          className="inline-flex items-center gap-1 text-[11px] font-medium text-primary transition-colors hover:text-primary/80"
        >
          <X className="size-3" strokeWidth={2} />
          Clear filters
        </button>
      )}
    </div>
  );
}
