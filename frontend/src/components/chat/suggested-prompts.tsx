"use client";

import {
  GitCompareArrows,
  ListChecks,
  Loader2,
  MessageSquareText,
  Mic,
  Sparkles,
  Target,
} from "lucide-react";

import { cn } from "@/lib/utils";

const PROMPT_ICONS = [
  ListChecks,
  Target,
  Mic,
  GitCompareArrows,
  MessageSquareText,
  Sparkles,
] as const;

interface SuggestedPromptsProps {
  prompts: string[];
  isLoading?: boolean;
  onSelect: (prompt: string) => void;
}

export function SuggestedPrompts({
  prompts,
  isLoading = false,
  onSelect,
}: SuggestedPromptsProps) {
  if (isLoading && prompts.length === 0) {
    return (
      <div className="flex items-center gap-2 px-1 pb-0.5 text-[11px] text-muted-foreground">
        <Loader2 className="size-3.5 animate-spin" strokeWidth={2} />
        Personalizing suggestions…
      </div>
    );
  }

  return (
    <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {prompts.map((label, index) => {
        const Icon = PROMPT_ICONS[index % PROMPT_ICONS.length];
        return (
          <button
            key={`${label}-${index}`}
            type="button"
            onClick={() => onSelect(label)}
            className={cn(
              "prompt-chip inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-[11px] font-medium text-muted-foreground transition-all sm:py-1.5",
              isLoading && "opacity-70",
            )}
          >
            <Icon className="size-3.5 shrink-0" strokeWidth={1.75} />
            {label}
          </button>
        );
      })}
    </div>
  );
}
