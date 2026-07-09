"use client";

import { SUGGESTED_PROMPTS } from "@/components/chat/constants";

interface SuggestedPromptsProps {
  onSelect: (prompt: string) => void;
}

export function SuggestedPrompts({ onSelect }: SuggestedPromptsProps) {
  return (
    <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {SUGGESTED_PROMPTS.map(({ label, icon: Icon }) => (
        <button
          key={label}
          type="button"
          onClick={() => onSelect(label)}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-border px-2.5 py-2 text-[11px] text-muted-foreground transition-colors active:border-primary/30 active:text-primary sm:py-1"
        >
          <Icon className="size-3.5 shrink-0" strokeWidth={1.5} />
          {label}
        </button>
      ))}
    </div>
  );
}
