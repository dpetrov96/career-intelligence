"use client";

import { ONBOARDING_STEPS } from "@/components/chat/constants";

export function ChatHeroSteps() {
  return (
    <div
      className="hero-fade-up mt-10 flex flex-wrap items-center justify-center gap-x-1 gap-y-2"
      style={{ animationDelay: "180ms" }}
    >
      {ONBOARDING_STEPS.map(({ num, label }, index) => (
        <div key={label} className="flex items-center">
          <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-mono text-[11px] tabular-nums text-primary/60">
              {num}
            </span>
            {label}
          </span>
          {index < ONBOARDING_STEPS.length - 1 && (
            <span aria-hidden className="mx-3 hidden text-border sm:inline">
              /
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
