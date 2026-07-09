"use client";

import { ONBOARDING_STEPS } from "@/components/chat/constants";
import type { OnboardingStep } from "@/lib/onboarding";
import { cn } from "@/lib/utils";

interface ChatHeroStepsProps {
  activeStep?: OnboardingStep;
}

export function ChatHeroSteps({ activeStep = 1 }: ChatHeroStepsProps) {
  return (
    <div
      className="hero-fade-up mt-10 flex flex-wrap items-center justify-center gap-x-1 gap-y-2"
      style={{ animationDelay: "180ms" }}
    >
      {ONBOARDING_STEPS.map(({ num, label, step }, index) => {
        const isActive = step === activeStep;
        const isDone = step < activeStep;

        return (
          <div key={label} className="flex items-center">
            <span
              className={cn(
                "inline-flex items-center gap-2 text-sm transition-colors",
                isActive
                  ? "font-medium text-foreground"
                  : isDone
                    ? "text-muted-foreground"
                    : "text-muted-foreground/50",
              )}
            >
              <span
                className={cn(
                  "font-mono text-[11px] tabular-nums",
                  isActive ? "text-primary" : "text-primary/40",
                )}
              >
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
        );
      })}
    </div>
  );
}
