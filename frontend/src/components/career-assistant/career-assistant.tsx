"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { ChatPanel } from "@/components/chat/chat-panel";
import { SessionSidebar } from "@/components/chat/session-sidebar";
import { MobileContextDrawer } from "@/components/jobs/mobile-context-drawer";
import { RightPanel } from "@/components/jobs/right-panel";
import { useLinkedInSync } from "@/hooks/use-linkedin-sync";
import { useJobs } from "@/hooks/use-jobs";
import { useSessions } from "@/hooks/use-sessions";
import type { ResumeSearchSuggestion } from "@/lib/api/documents";
import { uploadResume } from "@/lib/api/documents";
import { bestMatchJobId } from "@/lib/best-match";
import type { LinkedInSyncParams } from "@/lib/linkedin-sync";
import { HOME, sessionPath } from "@/lib/routes";

interface CareerAssistantProps {
  routeSessionId?: number | null;
}

export function CareerAssistant({ routeSessionId = null }: CareerAssistantProps) {
  const router = useRouter();
  const {
    sessions,
    activeSessionId,
    activeSession,
    isLoading: sessionsLoading,
    reload: reloadSessions,
  } = useSessions(routeSessionId);

  const { jobs, isLoading, error, reload: reloadJobs } = useJobs(activeSessionId);
  const linkedInSync = useLinkedInSync(reloadJobs);
  const [contextOpen, setContextOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [isUploadingCv, setIsUploadingCv] = useState(false);

  useEffect(() => {
    if (sessionsLoading || routeSessionId === null) return;

    const exists = sessions.some((session) => session.id === routeSessionId);
    if (!exists) {
      router.replace(HOME);
    }
  }, [routeSessionId, sessions, sessionsLoading, router]);

  useEffect(() => {
    setSelectedJobId(null);
  }, [activeSessionId]);

  const resumeFileName = activeSession?.resume_filename ?? null;
  const hasResume = activeSessionId !== null;

  useEffect(() => {
    if (!hasResume) setContextOpen(false);
  }, [hasResume]);

  useEffect(() => {
    if (isLoading || jobs.length === 0 || linkedInSync.isRunning || linkedInSync.isMatching) {
      if (!linkedInSync.isRunning && !linkedInSync.isMatching) {
        setSelectedJobId(null);
      }
      return;
    }

    setSelectedJobId((current) => {
      if (current !== null && jobs.some((job) => job.id === current)) {
        return current;
      }
      return bestMatchJobId(jobs);
    });
  }, [jobs, isLoading, linkedInSync.isRunning, linkedInSync.isMatching]);

  const showRolesPanel =
    hasResume &&
    jobs.length > 0 &&
    !linkedInSync.isRunning &&
    !linkedInSync.isMatching &&
    !isLoading;

  const handleFindMatches = useCallback(
    async (suggestion: ResumeSearchSuggestion) => {
      await linkedInSync.start({
        keywords: suggestion.keywords,
        location: suggestion.location,
        geo_id: suggestion.geo_id,
        limit: suggestion.limit,
      });
    },
    [linkedInSync],
  );

  const handleStartLinkedIn = useCallback(
    async (params: LinkedInSyncParams) => {
      await linkedInSync.start(params);
    },
    [linkedInSync],
  );

  async function handleResumeSelect(file: File) {
    setIsUploadingCv(true);
    try {
      const result = await uploadResume(file);
      await reloadSessions();
      router.push(sessionPath(result.session_id));
    } finally {
      setIsUploadingCv(false);
    }
  }

  const selectedJob =
    jobs.find((job) => job.id === selectedJobId) ?? null;

  return (
    <div className="flex h-dvh bg-background">
      {!sessionsLoading && sessions.length > 0 && (
        <SessionSidebar
          sessions={sessions}
          activeSessionId={activeSessionId}
        />
      )}

      <ChatPanel
        sessions={sessions}
        activeSessionId={activeSessionId}
        selectedJobId={selectedJobId}
        selectedJob={selectedJob}
        jobsCount={jobs.length}
        resumeFileName={resumeFileName}
        isUploadingCv={isUploadingCv}
        onResumeSelect={handleResumeSelect}
        syncStatus={linkedInSync.status}
        isFindingMatches={linkedInSync.isRunning}
        isMatching={linkedInSync.isMatching}
        onFindMatches={handleFindMatches}
        onStopFindMatches={linkedInSync.stop}
        onOpenContext={showRolesPanel ? () => setContextOpen(true) : undefined}
        showRolesPanel={showRolesPanel}
        autoFindMatches={false}
        onSelectJob={setSelectedJobId}
        className="min-h-0 min-w-0 flex-1"
      />

      {showRolesPanel && (
        <RightPanel
          jobs={jobs}
          isLoading={isLoading}
          error={error}
          onReload={reloadJobs}
          selectedJobId={selectedJobId}
          onSelectJob={setSelectedJobId}
          syncStatus={linkedInSync.status}
          isLinkedInRunning={linkedInSync.isRunning}
          isMatching={linkedInSync.isMatching}
          onFindMatches={handleFindMatches}
          onStartLinkedIn={handleStartLinkedIn}
          onStopLinkedIn={linkedInSync.stop}
          hasResume={hasResume}
          resumeFileName={resumeFileName}
          sessionId={activeSessionId}
          highlightImport={false}
        />
      )}

      {showRolesPanel && (
        <MobileContextDrawer
        open={contextOpen}
        onClose={() => setContextOpen(false)}
        jobs={jobs}
        isLoading={isLoading}
        error={error}
        onReload={reloadJobs}
        selectedJobId={selectedJobId}
        onSelectJob={setSelectedJobId}
        syncStatus={linkedInSync.status}
        isLinkedInRunning={linkedInSync.isRunning}
        isMatching={linkedInSync.isMatching}
        onFindMatches={handleFindMatches}
        onStartLinkedIn={handleStartLinkedIn}
        onStopLinkedIn={linkedInSync.stop}
        hasResume={hasResume}
        resumeFileName={resumeFileName}
        sessionId={activeSessionId}
        highlightImport={false}
        />
      )}
    </div>
  );
}
