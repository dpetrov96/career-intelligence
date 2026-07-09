"use client";

import { Loader2, Sparkles } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { LinkedInIcon } from "@/components/jobs/linkedin-sync-button";
import { LinkedInSyncProgress } from "@/components/jobs/linkedin-sync-progress";
import type { LinkedInSyncStatus } from "@/lib/api/types";
import { fetchResumeSearchSuggestions } from "@/lib/api/documents";
import type { ResumeSearchSuggestion } from "@/lib/api/documents";
import { cn } from "@/lib/utils";

interface FindMatchingRolesProps {
  sessionId: number;
  isRunning: boolean;
  syncStatus: LinkedInSyncStatus;
  onFindMatches: (suggestion: ResumeSearchSuggestion) => void;
  onStop: () => void;
  autoStart?: boolean;
  className?: string;
  variant?: "panel" | "hero";
}

export function FindMatchingRoles({
  sessionId,
  isRunning,
  syncStatus,
  onFindMatches,
  onStop,
  autoStart = false,
  className,
  variant = "panel",
}: FindMatchingRolesProps) {
  const [suggestion, setSuggestion] = useState<ResumeSearchSuggestion | null>(
    null,
  );
  const [isLoadingSuggestion, setIsLoadingSuggestion] = useState(true);
  const [isStartingScrape, setIsStartingScrape] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const autoStartedRef = useRef(false);

  const loadSuggestion = useCallback(async () => {
    setIsLoadingSuggestion(true);
    setError(null);
    try {
      const next = await fetchResumeSearchSuggestions(sessionId);
      setSuggestion(next);
      return next;
    } catch {
      setError("Could not analyze your CV. Try uploading again.");
      setSuggestion(null);
      return null;
    } finally {
      setIsLoadingSuggestion(false);
    }
  }, [sessionId]);

  useEffect(() => {
    autoStartedRef.current = false;
    void loadSuggestion();
  }, [loadSuggestion]);

  const startScrapeFromCv = useCallback(async () => {
    setIsStartingScrape(true);
    setError(null);
    try {
      const fresh = await fetchResumeSearchSuggestions(sessionId);
      setSuggestion(fresh);
      onFindMatches(fresh);
    } catch {
      setError("Could not analyze your CV. Try uploading again.");
    } finally {
      setIsStartingScrape(false);
    }
  }, [onFindMatches, sessionId]);

  useEffect(() => {
    if (
      !autoStart ||
      isRunning ||
      isLoadingSuggestion ||
      isStartingScrape ||
      !suggestion ||
      error ||
      autoStartedRef.current
    ) {
      return;
    }

    autoStartedRef.current = true;
    void startScrapeFromCv();
  }, [
    autoStart,
    error,
    isLoadingSuggestion,
    isRunning,
    isStartingScrape,
    startScrapeFromCv,
    suggestion,
  ]);

  if (isRunning) {
    if (variant === "hero") {
      return (
        <LinkedInSyncProgress
          status={syncStatus}
          onStop={onStop}
          className={className}
        />
      );
    }

    return (
      <div className={cn("px-5 py-10 text-center", className)}>
        <p className="text-sm text-muted-foreground">
          Scraping in progress — follow the progress bar in chat.
        </p>
      </div>
    );
  }

  const isHero = variant === "hero";
  const isBusy = isLoadingSuggestion || isStartingScrape;

  if (isHero && autoStart) {
    return (
      <div className={cn("mx-auto w-full max-w-md space-y-4", className)}>
        {isBusy ? (
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" strokeWidth={2.25} />
            Analyzing your CV for relevant roles…
          </div>
        ) : error ? (
          <>
            <p className="text-center text-sm text-muted-foreground">{error}</p>
            <button
              type="button"
              onClick={() => void startScrapeFromCv()}
              disabled={isBusy}
              className={cn(
                "flex w-full items-center justify-center gap-2.5 rounded-xl py-3.5 text-[14px] font-semibold tracking-[-0.01em] transition-all",
                "bg-primary text-primary-foreground shadow-[0_4px_14px_rgb(37_99_235_/_0.3)] hover:brightness-105 active:scale-[0.99]",
                "disabled:cursor-not-allowed disabled:opacity-60",
              )}
            >
              <LinkedInIcon className="size-4" />
              Retry analysis
            </button>
          </>
        ) : (
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" strokeWidth={2.25} />
            Starting import…
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        isHero ? "mx-auto w-full max-w-md space-y-5" : "space-y-5 px-5 py-8 sm:py-10",
        className,
      )}
    >
      <div className={cn("space-y-3", isHero && "text-center")}>
        {!isHero && (
          <div className="flex items-center gap-2">
            <Sparkles className="size-[18px] shrink-0 text-primary" />
            <h3 className="text-[15px] font-semibold tracking-[-0.02em] text-foreground">
              Recommended matches
            </h3>
          </div>
        )}

        {isLoadingSuggestion ? (
          <p className="text-sm text-muted-foreground">
            Analyzing your CV for relevant roles and region…
          </p>
        ) : error ? (
          <p className="text-sm text-muted-foreground">{error}</p>
        ) : suggestion ? (
          <p className="text-sm leading-relaxed text-muted-foreground">
            {suggestion.headline ||
              `We'll search LinkedIn for “${suggestion.keywords}” roles in ${suggestion.location}.`}
          </p>
        ) : null}
      </div>

      {!autoStart && (
        <button
          type="button"
          disabled={isBusy || Boolean(error)}
          onClick={() => void startScrapeFromCv()}
          className={cn(
            "flex w-full items-center justify-center gap-2.5 rounded-xl py-3.5 text-[14px] font-semibold tracking-[-0.01em] transition-all",
            "bg-primary text-primary-foreground shadow-[0_4px_14px_rgb(37_99_235_/_0.3)] hover:brightness-105 active:scale-[0.99]",
            "disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100",
          )}
        >
          {isBusy ? (
            <>
              <Loader2 className="size-4 animate-spin" strokeWidth={2.25} />
              Analyzing CV…
            </>
          ) : (
            <>
              <LinkedInIcon className="size-4" />
              Scrape from LinkedIn
            </>
          )}
        </button>
      )}

      {autoStart && isBusy && (
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" strokeWidth={2.25} />
          Analyzing CV before search…
        </div>
      )}

      {syncStatus.message && syncStatus.status !== "idle" && (
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          {syncStatus.message}
        </p>
      )}
    </div>
  );
}
