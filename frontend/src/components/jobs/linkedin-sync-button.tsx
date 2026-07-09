"use client";

import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

const LINKEDIN_BLUE = "#2563eb";

export function LinkedInIcon({
  className,
  colored = false,
}: {
  className?: string;
  colored?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={colored ? LINKEDIN_BLUE : "currentColor"}
      aria-hidden
      className={className}
    >
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

const flatBase =
  "group inline-flex items-center justify-center gap-2 border-0 bg-transparent p-0 font-medium text-foreground transition-colors hover:text-primary disabled:pointer-events-none disabled:opacity-50";

interface LinkedInSyncButtonProps {
  onClick: () => void;
  isLoading?: boolean;
  variant?: "compact" | "hero";
  className?: string;
}

export function LinkedInSyncButton({
  onClick,
  isLoading = false,
  variant = "compact",
  className,
}: LinkedInSyncButtonProps) {
  const isHero = variant === "hero";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isLoading}
      className={cn(
        flatBase,
        isHero
          ? "gap-2.5 text-[15px] font-semibold tracking-[-0.02em]"
          : "min-h-9 gap-1.5 text-[11px]",
        isLoading && "cursor-wait text-muted-foreground",
        className,
      )}
    >
      {isLoading ? (
        <Loader2
          className={cn(
            "animate-spin text-muted-foreground",
            isHero ? "size-5" : "size-3.5",
          )}
          strokeWidth={2}
        />
      ) : (
        <LinkedInIcon
          colored
          className={cn(
            "shrink-0 transition-opacity group-hover:opacity-90",
            isHero ? "size-5" : "size-3.5",
          )}
        />
      )}
      <span
        className={cn(
          !isLoading &&
            "underline decoration-transparent underline-offset-[5px] transition-[text-decoration-color] group-hover:decoration-primary/35",
        )}
      >
        {isLoading
          ? isHero
            ? "Importing roles…"
            : "Syncing…"
          : isHero
            ? "Import from LinkedIn"
            : "LinkedIn"}
      </span>
    </button>
  );
}
