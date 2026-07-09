"use client";

import type { JobPosting } from "@/lib/jobs";
import { cn } from "@/lib/utils";

interface RoleContextChipProps {
  job: JobPosting | null;
  variant?: "inline" | "hero" | "composer" | "adornment";
  className?: string;
}

export function RoleContextChip({
  job,
  variant = "inline",
  className,
}: RoleContextChipProps) {
  if (!job) return null;

  const isHero = variant === "hero";
  const isComposer = variant === "composer";
  const isAdornment = variant === "adornment";

  return (
    <div
      className={cn(
        "inline-flex min-w-0 max-w-full items-center gap-1.5",
        isHero
          ? "rounded-full border border-border/80 bg-surface/80 px-3.5 py-1.5 text-xs shadow-sm backdrop-blur-sm"
          : isComposer
            ? "rounded-full border border-border/70 bg-white/70 px-2.5 py-1 text-[11px] backdrop-blur-sm"
            : isAdornment
              ? "text-[11px] leading-snug sm:text-xs"
              : "rounded-full border border-border px-3 py-1 text-[11px]",
        className,
      )}
    >
      <span className="size-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
      <span className="min-w-0 truncate text-muted-foreground">
        {isAdornment ? (
          <>
            <span className="font-medium text-foreground/80">Context</span>
            <span aria-hidden> · </span>
            <span className="font-medium text-foreground">
              {job.title}
            </span>
            <span aria-hidden> · </span>
            <span>{job.company}</span>
          </>
        ) : (
          <>
            {isComposer ? "Context: " : "Analyzing "}
            <span className="font-medium text-foreground">
              {job.title} · {job.company}
            </span>
          </>
        )}
        {job.match_score != null && (
          <span className="font-semibold text-emerald-700">
            {" "}
            · {Math.round(job.match_score)}%
          </span>
        )}
      </span>
    </div>
  );
}
