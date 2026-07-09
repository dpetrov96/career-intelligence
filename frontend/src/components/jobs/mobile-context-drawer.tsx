"use client";

import { useEffect } from "react";

import { ContextPanelContent } from "@/components/jobs/context-panel-content";
import type { ResumeSearchSuggestion } from "@/lib/api/documents";
import type { LinkedInSyncStatus } from "@/lib/api/types";
import type { JobPosting } from "@/lib/jobs";
import type { LinkedInSyncParams } from "@/lib/linkedin-sync";
import { cn } from "@/lib/utils";

interface MobileContextDrawerProps {
  open: boolean;
  onClose: () => void;
  jobs: JobPosting[];
  isLoading: boolean;
  error: string | null;
  onReload: () => void;
  selectedJobId: number | null;
  onSelectJob: (id: number) => void;
  syncStatus: LinkedInSyncStatus;
  isLinkedInRunning: boolean;
  isMatching?: boolean;
  onFindMatches: (suggestion: ResumeSearchSuggestion) => void;
  onStartLinkedIn: (params: LinkedInSyncParams) => void;
  onStopLinkedIn: () => void;
  hasResume: boolean;
  resumeFileName: string | null;
  sessionId: number | null;
  autoFindMatches?: boolean;
  highlightImport?: boolean;
}

export function MobileContextDrawer({
  open,
  onClose,
  selectedJobId,
  onSelectJob,
  jobs,
  isLoading,
  error,
  onReload,
  syncStatus,
  isLinkedInRunning,
  isMatching = false,
  onFindMatches,
  onStartLinkedIn,
  onStopLinkedIn,
  hasResume,
  resumeFileName,
  sessionId,
  autoFindMatches,
  highlightImport,
}: MobileContextDrawerProps) {
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  return (
    <>
      <button
        type="button"
        aria-label="Close positions panel"
        onClick={onClose}
        className={cn(
          "fixed inset-0 z-40 bg-slate-900/25 backdrop-blur-[2px] transition-opacity duration-300 lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Recommended matches"
        aria-hidden={!open}
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex w-full max-w-none flex-col panel-shell shadow-[-8px_0_32px_-12px_rgba(15,23,42,0.12)] transition-transform duration-300 ease-out sm:max-w-sm lg:hidden",
          open ? "translate-x-0" : "pointer-events-none translate-x-full",
        )}
      >
        <ContextPanelContent
          jobs={jobs}
          isLoading={isLoading}
          error={error}
          onReload={onReload}
          selectedJobId={selectedJobId}
          onSelectJob={onSelectJob}
          onJobSelected={onClose}
          onClose={onClose}
          syncStatus={syncStatus}
          isLinkedInRunning={isLinkedInRunning}
          isMatching={isMatching}
          onFindMatches={onFindMatches}
          onStartLinkedIn={onStartLinkedIn}
          onStopLinkedIn={onStopLinkedIn}
          hasResume={hasResume}
          resumeFileName={resumeFileName}
          sessionId={sessionId}
          autoFindMatches={autoFindMatches}
          highlightImport={highlightImport}
        />
      </aside>
    </>
  );
}
