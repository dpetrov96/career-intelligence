"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

interface CompanyLogoProps {
  company: string;
  domain: string;
  logoUrl?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZE_MAP = {
  sm: "size-9",
  md: "size-12",
  lg: "size-14",
} as const;

const PX_MAP = {
  sm: 36,
  md: 48,
  lg: 56,
} as const;

export function CompanyLogo({
  company,
  domain,
  logoUrl,
  size = "md",
  className,
}: CompanyLogoProps) {
  const [hasError, setHasError] = useState(false);
  const dimension = SIZE_MAP[size];
  const px = PX_MAP[size];
  const src = logoUrl || (domain ? `https://logo.clearbit.com/${domain}` : null);

  if (!src || hasError) {
    return (
      <div
        className={cn(
          "flex shrink-0 items-center justify-center rounded-sm bg-accent text-sm font-semibold text-primary",
          dimension,
          className,
        )}
        aria-hidden
      >
        {company.charAt(0)}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={`${company} logo`}
      width={px}
      height={px}
      className={cn(
        "shrink-0 rounded-sm border border-border bg-white object-contain p-1",
        dimension,
        className,
      )}
      onError={() => setHasError(true)}
    />
  );
}
