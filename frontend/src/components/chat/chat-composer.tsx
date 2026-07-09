"use client";

import { ArrowUp } from "lucide-react";

import { SuggestedPrompts } from "@/components/chat/suggested-prompts";
import { Textarea } from "@/components/ui/textarea";

interface ChatComposerProps {
  input: string;
  onInputChange: (value: string) => void;
  onSend: (text?: string) => void;
  showSuggestions: boolean;
  resumeFileName: string | null;
  showResumeHint: boolean;
}

export function ChatComposer({
  input,
  onInputChange,
  onSend,
  showSuggestions,
  resumeFileName,
  showResumeHint,
}: ChatComposerProps) {
  return (
    <div className="relative z-10 shrink-0 border-t border-border px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 sm:px-10 sm:pb-[calc(1.25rem+env(safe-area-inset-bottom))] sm:pt-5">
      <div className="mx-auto w-full max-w-2xl space-y-2.5 sm:space-y-3">
        {showSuggestions && <SuggestedPrompts onSelect={onSend} />}

        <div className="flex items-end gap-2 rounded-xl border border-border px-3 py-2 transition-colors focus-within:border-primary/40 sm:gap-3 sm:px-5 sm:py-3">
          <Textarea
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSend();
              }
            }}
            placeholder="Ask a question..."
            rows={1}
            className="min-h-[44px] max-h-32 flex-1 resize-none border-0 bg-transparent px-0 py-2 text-base leading-6 shadow-none placeholder:text-muted-foreground focus-visible:ring-0 sm:min-h-[56px] sm:py-1 sm:text-lg sm:leading-8"
          />
          <button
            type="button"
            onClick={() => onSend()}
            disabled={!input.trim()}
            className="mb-0.5 flex size-11 shrink-0 items-center justify-center text-primary transition-opacity disabled:opacity-25 sm:mb-1.5 sm:size-auto sm:p-1"
            aria-label="Send message"
          >
            <ArrowUp className="size-5" strokeWidth={1.75} />
          </button>
        </div>

        {showResumeHint && resumeFileName && (
          <p className="truncate text-xs text-muted-foreground">
            CV: <span className="text-foreground">{resumeFileName}</span>
          </p>
        )}
      </div>
    </div>
  );
}
