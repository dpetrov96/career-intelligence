"use client";

import { CompanyLogo } from "@/components/jobs/company-logo";
import type { JobPosting } from "@/lib/jobs";
import { cn } from "@/lib/utils";

interface JobPostingItemProps {
  job: JobPosting;
  isSelected: boolean;
  onSelect: (id: number) => void;
}

export function JobPostingItem({
  job,
  isSelected,
  onSelect,
}: JobPostingItemProps) {
  return (
    <li>
      <button
        type="button"
        onClick={() => onSelect(job.id)}
        aria-current={isSelected ? "true" : undefined}
        className={cn(
          "flex w-full gap-3 border-l-[3px] px-4 py-3.5 text-left transition-colors duration-100 active:bg-brand-light/60 sm:px-5 sm:py-4",
          isSelected
            ? "border-l-primary bg-accent"
            : "border-l-transparent",
        )}
      >
        <CompanyLogo
          company={job.company}
          domain={job.domain}
          size="md"
          className="max-sm:size-10"
        />

        <span className="min-w-0 flex-1">
          <span
            className={cn(
              "block text-[14px] leading-[1.35]",
              isSelected
                ? "font-semibold text-primary"
                : "font-normal text-foreground",
            )}
          >
            {job.title}
          </span>

          <span
            className={cn(
              "mt-0.5 block text-[12px] leading-snug sm:mt-1",
              isSelected ? "text-primary/80" : "text-muted-foreground",
            )}
          >
            {job.company}
          </span>

          <span className="mt-0.5 block truncate text-[12px] leading-snug text-muted-foreground sm:mt-1">
            {job.location}
            <span aria-hidden> · </span>
            {job.type}
          </span>
        </span>
      </button>
    </li>
  );
}
