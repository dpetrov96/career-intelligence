"use client";

import { ArrowUp } from "lucide-react";

import { RoleContextChip } from "@/components/chat/role-context-chip";
import { SuggestedPrompts } from "@/components/chat/suggested-prompts";
import { Textarea } from "@/components/ui/textarea";
import { useSuggestedPrompts } from "@/hooks/use-suggested-prompts";
import type { OnboardingStep } from "@/lib/onboarding";
import type { JobPosting } from "@/lib/jobs";
import { cn } from "@/lib/utils";

interface ChatComposerProps {
  input: string;
  onInputChange: (value: string) => void;
  onSend: (text?: string) => void;
  isSending?: boolean;
  step: OnboardingStep;
  sessionId: number | null;
  selectedJobId: number | null;
  selectedJob: JobPosting | null;
  messageCount: number;
  isScrolled?: boolean;
}

const PLACEHOLDERS: Record<OnboardingStep, string> = {
  1: "Upload your CV to get started…",
  2: "Find matching roles to continue…",
  3: "Ask about skill gaps, fit, or interview prep…",
};

export function ChatComposer({
  input,
  onInputChange,
  onSend,
  isSending = false,
  step,
  sessionId,
  selectedJobId,
  selectedJob,
  messageCount,
  isScrolled = false,
}: ChatComposerProps) {
  const canChat = step === 3;
  const { prompts, isLoading } = useSuggestedPrompts(
    sessionId,
    selectedJobId,
    messageCount,
  );

  return (
    <div
      data-scrolled={isScrolled}
      className={cn(
        "composer-bar relative z-10 shrink-0 glass-bar border-t px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 sm:px-10 sm:pb-[calc(1.25rem+env(safe-area-inset-bottom))] sm:pt-5",
      )}
    >
      <div className="mx-auto w-full max-w-2xl space-y-2.5 sm:space-y-3">
        {canChat && (
          <SuggestedPrompts
            prompts={prompts}
            isLoading={isLoading}
            onSelect={onSend}
          />
        )}

        <div className="composer-shell overflow-hidden rounded-2xl">
          {canChat && selectedJob && (
            <div className="flex items-center border-b border-border/60 bg-primary/[0.04] px-3 py-2 sm:px-4">
              <RoleContextChip job={selectedJob} variant="adornment" />
            </div>
          )}

          <div className="flex items-end gap-2 px-3 py-2 sm:gap-3 sm:px-4 sm:py-2.5">
            <Textarea
              value={input}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (canChat) onSend();
                }
              }}
              placeholder={PLACEHOLDERS[step]}
              disabled={!canChat || isSending}
              rows={1}
              className="min-h-[44px] max-h-32 flex-1 resize-none border-0 bg-transparent px-0 py-2 text-[15px] leading-6 shadow-none placeholder:text-muted-foreground focus-visible:ring-0 disabled:bg-transparent disabled:opacity-60 sm:min-h-[48px]"
            />
            <button
              type="button"
              onClick={() => onSend()}
              disabled={!canChat || !input.trim() || isSending}
              aria-busy={isSending}
              className={cn(
                "mb-0.5 flex size-10 shrink-0 items-center justify-center rounded-full text-white transition-all active:scale-95 sm:mb-1",
                "btn-send disabled:opacity-40",
              )}
              aria-label="Send message"
            >
              <ArrowUp className="size-4" strokeWidth={2} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
