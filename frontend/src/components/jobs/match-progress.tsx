"use client";

import { cn } from "@/lib/utils";

interface MatchProgressProps {
  importedCount?: number;
  className?: string;
}

export function MatchProgress({
  importedCount,
  className,
}: MatchProgressProps) {
  return (
    <div className={cn("w-full px-1 py-2 sm:px-0", className)}>
      <div className="composer-shell space-y-4 rounded-2xl p-4 sm:p-5">
        <div>
          <p className="text-[14px] font-semibold tracking-[-0.02em] text-foreground">
            Ranking roles against your CV
          </p>
          <p className="mt-0.5 text-[12px] text-muted-foreground">
            {importedCount && importedCount > 0
              ? `Calculating fit scores for ${importedCount} imported role${importedCount === 1 ? "" : "s"}…`
              : "Calculating fit scores for imported roles…"}
          </p>
        </div>

        <div className="relative h-1.5 overflow-hidden rounded-full bg-accent">
          <div className="match-progress-bar absolute inset-y-0 w-1/3 rounded-full bg-primary" />
        </div>

        <div className="flex items-center justify-center gap-1.5 pt-1">
          {[0, 1, 2].map((index) => (
            <span
              key={index}
              className="typing-dot size-2 rounded-full bg-primary/55"
              style={{ animationDelay: `${index * 160}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
