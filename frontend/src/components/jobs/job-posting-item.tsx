"use client";

import { CompanyLogo } from "@/components/jobs/company-logo";
import { Badge } from "@/components/ui/badge";
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
        data-selected={isSelected}
        className="job-card flex w-full gap-3 px-3.5 py-3 text-left sm:px-4 sm:py-3.5"
      >
        <CompanyLogo
          company={job.company}
          domain={job.domain}
          logoUrl={job.logo_url}
          size="md"
          className="max-sm:size-10"
        />

        <span className="min-w-0 flex-1">
          <span className="flex items-start gap-2">
            <span
              className={cn(
                "block min-w-0 flex-1 text-[14px] leading-[1.35]",
                isSelected
                  ? "font-semibold text-primary"
                  : "font-medium text-foreground",
              )}
            >
              {job.title}
            </span>
            {job.match_score != null && (
              <Badge
                variant="secondary"
                className={cn(
                  "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold tabular-nums",
                  job.match_score >= 70 && "bg-emerald-500/15 text-emerald-700",
                  job.match_score >= 50 &&
                    job.match_score < 70 &&
                    "bg-amber-500/15 text-amber-700",
                )}
              >
                {Math.round(job.match_score)}%
              </Badge>
            )}
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
