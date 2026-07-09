"use client";

import { CheckCircle2 } from "lucide-react";

import { ChatHeroSteps } from "@/components/chat/chat-hero-steps";
import { CvDropzone } from "@/components/chat/cv-dropzone";
import { FindMatchingRoles } from "@/components/jobs/find-matching-roles";
import { MatchProgress } from "@/components/jobs/match-progress";
import type { ResumeSearchSuggestion } from "@/lib/api/documents";
import type { LinkedInSyncStatus } from "@/lib/api/types";
import type { OnboardingStep } from "@/lib/onboarding";

interface ChatEmptyStateProps {
  step: OnboardingStep;
  resumeFileName: string | null;
  sessionId: number | null;
  isUploadingCv?: boolean;
  onFileSelect: (file: File) => void;
  syncStatus?: LinkedInSyncStatus;
  isFindingMatches?: boolean;
  isMatching?: boolean;
  onFindMatches?: (suggestion: ResumeSearchSuggestion) => void;
  onStopFindMatches?: () => void;
  autoFindMatches?: boolean;
}

export function ChatEmptyState({
  step,
  resumeFileName,
  sessionId,
  isUploadingCv = false,
  onFileSelect,
  syncStatus,
  isFindingMatches = false,
  isMatching = false,
  onFindMatches,
  onStopFindMatches,
  autoFindMatches = false,
}: ChatEmptyStateProps) {
  return (
    <div className="relative z-10 w-full px-4 py-5 sm:flex sm:min-h-[calc(100dvh-12rem)] sm:flex-col sm:items-center sm:justify-center sm:px-8 sm:py-10">
      <div className="mx-auto flex w-full max-w-xl flex-col items-center text-center">
        {step === 1 && (
          <h1
            className="hero-fade-up text-[28px] font-semibold leading-[1.08] tracking-[-0.04em] sm:text-[48px] sm:leading-[1.05]"
            style={{ animationDelay: "0ms" }}
          >
            <span className="hero-gradient-text">Career fit</span>{" "}
            <span className="text-foreground">analysis</span>
          </h1>
        )}

        {step === 2 && (
          <>
            <div
              className="hero-fade-up mb-4 flex items-center justify-center gap-2 text-sm text-foreground"
              style={{ animationDelay: "0ms" }}
            >
              <CheckCircle2 className="size-4 text-primary" strokeWidth={2} />
              <span className="truncate font-medium">{resumeFileName}</span>
            </div>
            {!isFindingMatches && !isMatching && (
              <>
                <h1
                  className="hero-fade-up text-[24px] font-semibold leading-[1.12] tracking-[-0.03em] sm:text-[36px]"
                  style={{ animationDelay: "40ms" }}
                >
                  Import roles from LinkedIn
                </h1>
                <p
                  className="hero-fade-up mt-3 max-w-md text-sm leading-relaxed text-muted-foreground"
                  style={{ animationDelay: "80ms" }}
                >
                  Your CV is ready. Start a LinkedIn scrape below — fit analysis
                  begins after roles are imported.
                </p>
              </>
            )}
          </>
        )}

        {step === 1 && (
          <>
            <p
              className="hero-fade-up mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground sm:mt-4 sm:text-base"
              style={{ animationDelay: "60ms" }}
            >
              Upload your CV to start a new analysis session. After upload you
              can scrape matching roles from LinkedIn in chat.
            </p>
            <div
              className="hero-fade-up mt-5 w-full sm:mt-8"
              style={{ animationDelay: "120ms" }}
            >
              <CvDropzone
                fileName={resumeFileName}
                isUploading={isUploadingCv}
                onFileSelect={onFileSelect}
              />
            </div>
          </>
        )}

        {step === 2 && isMatching && (
          <div
            className="hero-fade-up mt-5 w-full sm:mt-6"
            style={{ animationDelay: "120ms" }}
          >
            <MatchProgress importedCount={syncStatus?.imported} />
          </div>
        )}

        {step === 2 &&
          !isMatching &&
          sessionId &&
          onFindMatches &&
          onStopFindMatches &&
          syncStatus && (
            <div
              className="hero-fade-up mt-5 w-full sm:mt-6"
              style={{ animationDelay: "120ms" }}
            >
              <FindMatchingRoles
                variant="hero"
                sessionId={sessionId}
                isRunning={isFindingMatches}
                syncStatus={syncStatus}
                onFindMatches={onFindMatches}
                onStop={onStopFindMatches}
                autoStart={autoFindMatches}
              />
            </div>
          )}

        <div className="hidden sm:block">
          <ChatHeroSteps activeStep={step} />
        </div>
      </div>
    </div>
  );
}
