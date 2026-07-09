"use client";

import { PanelRight } from "lucide-react";

interface ChatMobileHeaderProps {
  onOpenContext?: () => void;
}

export function ChatMobileHeader({ onOpenContext }: ChatMobileHeaderProps) {
  return (
    <header className="flex shrink-0 items-center justify-between border-b border-border px-4 pb-2.5 pt-[max(0.625rem,env(safe-area-inset-top))] lg:hidden">
      <span className="text-sm font-semibold tracking-[-0.02em] text-foreground">
        Career fit
      </span>
      <button
        type="button"
        onClick={onOpenContext}
        className="inline-flex min-h-9 items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors active:bg-accent"
        aria-label="Open positions"
      >
        <PanelRight className="size-3.5" strokeWidth={1.75} />
        Roles
      </button>
    </header>
  );
}
