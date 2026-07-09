"use client";

import { ChatComposer } from "@/components/chat/chat-composer";
import { ChatEmptyState } from "@/components/chat/chat-empty-state";
import { ChatHeroBackground } from "@/components/chat/chat-hero-background";
import { ChatMessageList } from "@/components/chat/chat-message-list";
import { ChatMobileHeader } from "@/components/chat/chat-mobile-header";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChat } from "@/hooks/use-chat";
import type { ResumeSearchSuggestion } from "@/lib/api/documents";
import type { ChatSession } from "@/lib/api/sessions";
import type { LinkedInSyncStatus } from "@/lib/api/types";
import type { JobPosting } from "@/lib/jobs";
import { getOnboardingStep } from "@/lib/onboarding";
import { cn } from "@/lib/utils";
import { useCallback, useEffect, useMemo, useState } from "react";

interface ChatPanelProps {
  sessions: ChatSession[];
  activeSessionId: number | null;
  selectedJobId: number | null;
  selectedJob: JobPosting | null;
  jobsCount: number;
  resumeFileName: string | null;
  isUploadingCv?: boolean;
  onResumeSelect: (file: File) => void;
  syncStatus: LinkedInSyncStatus;
  isFindingMatches: boolean;
  isMatching?: boolean;
  onFindMatches: (suggestion: ResumeSearchSuggestion) => void;
  onStopFindMatches: () => void;
  autoFindMatches?: boolean;
  onOpenContext?: () => void;
  showRolesPanel?: boolean;
  onSelectJob?: (jobId: number) => void;
  className?: string;
}

export function ChatPanel({
  sessions,
  activeSessionId,
  selectedJobId,
  selectedJob,
  jobsCount,
  resumeFileName,
  isUploadingCv = false,
  onResumeSelect,
  syncStatus,
  isFindingMatches,
  isMatching = false,
  onFindMatches,
  onStopFindMatches,
  autoFindMatches = false,
  onOpenContext,
  showRolesPanel = false,
  onSelectJob,
  className,
}: ChatPanelProps) {
  const step = getOnboardingStep(
    activeSessionId !== null,
    jobsCount,
    isFindingMatches,
    isMatching,
  );

  const welcomeContext = useMemo(() => {
    if (step !== 3 || !selectedJob) return null;
    return {
      jobId: selectedJob.id,
      matchCount: jobsCount,
      matchScore: selectedJob.match_score,
    };
  }, [step, selectedJob, jobsCount]);

  const {
    messages,
    input,
    setInput,
    send,
    showEmptyHero,
    isSending,
    isTypingWelcome,
  } = useChat(activeSessionId, selectedJobId, welcomeContext);

  const showHero = showEmptyHero && step < 3;
  const [isComposerScrolled, setIsComposerScrolled] = useState(false);

  const handleMessageScroll = useCallback(
    (event: React.UIEvent<HTMLDivElement>) => {
      setIsComposerScrolled(event.currentTarget.scrollTop > 8);
    },
    [],
  );

  useEffect(() => {
    if (showHero) setIsComposerScrolled(false);
  }, [showHero, activeSessionId]);

  return (
    <section
      className={cn(
        "relative flex min-h-0 flex-col overflow-hidden app-shell",
        className,
      )}
    >
      {showHero && (
        <ChatHeroBackground className="pointer-events-none absolute inset-0 overflow-hidden max-lg:opacity-80" />
      )}

      <ChatMobileHeader
        sessions={sessions}
        activeSessionId={activeSessionId}
        onOpenContext={onOpenContext}
        showRolesPanel={showRolesPanel}
      />

      <ScrollArea
        className="relative z-10 min-h-0 flex-1"
        onViewportScroll={showHero ? undefined : handleMessageScroll}
      >
        <div className="flex min-h-full w-full flex-col">
          {showHero ? (
            <ChatEmptyState
              step={step}
              resumeFileName={resumeFileName}
              sessionId={activeSessionId}
              isUploadingCv={isUploadingCv}
              onFileSelect={onResumeSelect}
              syncStatus={syncStatus}
              isFindingMatches={isFindingMatches}
              isMatching={isMatching}
              onFindMatches={onFindMatches}
              onStopFindMatches={onStopFindMatches}
              autoFindMatches={autoFindMatches}
            />
          ) : (
            <ChatMessageList
              messages={messages}
              isTyping={isTypingWelcome || isSending}
              selectedJobId={selectedJobId}
              onSelectJob={onSelectJob}
            />
          )}
        </div>
      </ScrollArea>

      <ChatComposer
        input={input}
        onInputChange={setInput}
        onSend={send}
        isSending={isSending}
        step={step}
        sessionId={activeSessionId}
        selectedJobId={selectedJobId}
        selectedJob={selectedJob}
        messageCount={messages.length}
        isScrolled={isComposerScrolled}
      />
    </section>
  );
}
