"use client";

import { Square } from "lucide-react";

import type { LinkedInSyncStatus } from "@/lib/api/types";
import { cn } from "@/lib/utils";

interface LinkedInSyncProgressProps {
  status: LinkedInSyncStatus;
  onStop: () => void;
  variant?: "full" | "slim";
  className?: string;
}

export function LinkedInSyncProgress({
  status,
  onStop,
  variant = "full",
  className,
}: LinkedInSyncProgressProps) {
  const progress =
    status.total > 0
      ? Math.min(100, Math.round((status.current / status.total) * 100))
      : status.status === "searching"
        ? 8
        : 0;

  if (variant === "slim") {
    return (
      <div className={cn("space-y-2 px-5", className)}>
        <div className="flex items-center justify-between gap-3">
          <p className="truncate text-[11px] text-muted-foreground">
            {status.current_item ?? status.phase ?? "Importing…"}
          </p>
          <button
            type="button"
            onClick={onStop}
            className="shrink-0 text-[11px] font-medium text-muted-foreground hover:text-destructive"
          >
            Stop
          </button>
        </div>
        <div className="h-1 overflow-hidden rounded-full bg-accent">
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={cn("w-full px-1 py-2 sm:px-0", className)}>
      <div className="composer-shell space-y-4 rounded-2xl p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[14px] font-semibold tracking-[-0.02em] text-foreground">
              Importing from LinkedIn
            </p>
            <p className="mt-0.5 text-[12px] text-muted-foreground">
              {status.phase ?? "Working…"}
            </p>
          </div>
          <button
            type="button"
            onClick={onStop}
            className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-[11px] font-medium text-muted-foreground transition-colors hover:border-destructive/40 hover:text-destructive"
          >
            <Square className="size-3 fill-current" />
            Stop
          </button>
        </div>

        <div className="h-1.5 overflow-hidden rounded-full bg-accent">
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
          <span>
            {status.total > 0
              ? `${status.current} / ${status.total}`
              : "Searching…"}
          </span>
          <span>
            {status.imported} imported · {status.skipped} skipped
          </span>
        </div>

        {status.current_item && (
          <div className="border-t border-border/80 pt-4">
            <p className="text-[10px] font-medium tracking-[0.04em] text-muted-foreground uppercase">
              Now scraping
            </p>
            <p className="mt-1.5 text-[13px] leading-snug text-foreground">
              {status.current_item}
            </p>
          </div>
        )}

        {status.keywords && (
          <p className="text-[11px] text-muted-foreground/80">
            {status.keywords} · {status.location} · up to {status.limit} roles
          </p>
        )}
      </div>
    </div>
  );
}
