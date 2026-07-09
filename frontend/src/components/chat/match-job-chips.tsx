"use client";

import { CompanyLogo } from "@/components/jobs/company-logo";
import type { JobMatchChip } from "@/types/chat";
import { cn } from "@/lib/utils";

interface MatchJobChipsProps {
  jobs: JobMatchChip[];
  selectedJobId?: number | null;
  onSelectJob?: (jobId: number) => void;
}

export function MatchJobChips({
  jobs,
  selectedJobId = null,
  onSelectJob,
}: MatchJobChipsProps) {
  if (jobs.length === 0) return null;

  return (
    <div className="space-y-1.5">
      <p className="text-[11px] font-medium text-muted-foreground">
        Other matches
      </p>
      <div className="flex flex-wrap gap-1.5">
        {jobs.map((job) => {
          const isSelected = job.id === selectedJobId;

          return (
            <button
              key={job.id}
              type="button"
              onClick={() => onSelectJob?.(job.id)}
              className={cn(
                "prompt-chip inline-flex max-w-full items-center gap-1.5 rounded-full py-1 pl-1 pr-2.5 text-left transition-all",
                isSelected && "border-primary/40 bg-primary/5",
              )}
            >
              <CompanyLogo
                company={job.company}
                domain={job.domain}
                logoUrl={job.logo_url}
                size="sm"
                className="!size-6 rounded-full p-0.5"
              />
              <span className="text-[10px] font-medium leading-snug text-foreground">
                {job.title}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
