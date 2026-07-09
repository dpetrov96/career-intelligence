"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { LinkedInIcon, LinkedInSyncButton } from "@/components/jobs/linkedin-sync-button";
import { Input } from "@/components/ui/input";
import {
  DEFAULT_LINKEDIN_SYNC,
  LINKEDIN_KEYWORD_SUGGESTIONS,
  LINKEDIN_LIMIT_OPTIONS,
  LINKEDIN_LOCATIONS,
  type LinkedInSyncParams,
} from "@/lib/linkedin-sync";
import { cn } from "@/lib/utils";

interface LinkedInSyncFlowProps {
  variant?: "compact" | "embedded";
  isRunning?: boolean;
  onStart: (params: LinkedInSyncParams) => void;
  keywordSuggestions?: string[];
  className?: string;
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2.5 text-[12px] font-medium text-foreground">{children}</p>
  );
}

function OptionPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full border px-3 py-1.5 text-[11px] font-medium transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border text-muted-foreground hover:border-primary/30 hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

function LinkedInSyncConfigPanel({
  params,
  onChange,
  onSubmit,
  isSyncing,
  layout,
  onCancel,
  keywordSuggestions = LINKEDIN_KEYWORD_SUGGESTIONS,
  className,
}: {
  params: LinkedInSyncParams;
  onChange: (params: LinkedInSyncParams) => void;
  onSubmit: () => void;
  isSyncing: boolean;
  layout: "embedded" | "dropdown";
  onCancel?: () => void;
  keywordSuggestions?: readonly string[];
  className?: string;
}) {
  const isEmbedded = layout === "embedded";

  return (
    <div
      className={cn(
        isEmbedded ? "space-y-6" : "space-y-4 rounded-2xl border border-border/80 bg-white/90 p-4 shadow-sm backdrop-blur-sm",
        className,
      )}
    >
      {isEmbedded && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <LinkedInIcon colored className="size-[18px] shrink-0" />
            <h3 className="text-[15px] font-semibold tracking-[-0.02em] text-foreground">
              Import from LinkedIn
            </h3>
          </div>
          <div className="h-px bg-gradient-to-r from-primary/35 via-border to-transparent" />
        </div>
      )}

      <div>
        <FieldLabel>Keywords</FieldLabel>
        <Input
          value={params.keywords}
          onChange={(event) =>
            onChange({ ...params, keywords: event.target.value })
          }
          placeholder="e.g. software engineer"
          disabled={isSyncing}
          className="h-10 border-border/80 bg-transparent text-[13px] shadow-none"
        />
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {keywordSuggestions.map((keyword) => (
            <OptionPill
              key={keyword}
              active={params.keywords === keyword}
              onClick={() => onChange({ ...params, keywords: keyword })}
            >
              {keyword}
            </OptionPill>
          ))}
        </div>
      </div>

      <div>
        <FieldLabel>Location</FieldLabel>
        <div className="flex flex-wrap gap-1.5">
          {LINKEDIN_LOCATIONS.map((item) => (
            <OptionPill
              key={item.geoId}
              active={params.geo_id === item.geoId}
              onClick={() =>
                onChange({
                  ...params,
                  geo_id: item.geoId,
                  location: item.location,
                })
              }
            >
              {item.label}
            </OptionPill>
          ))}
        </div>
      </div>

      <div>
        <FieldLabel>How many roles</FieldLabel>
        <div className="flex flex-wrap gap-1.5">
          {LINKEDIN_LIMIT_OPTIONS.map((limit) => (
            <OptionPill
              key={limit}
              active={params.limit === limit}
              onClick={() => onChange({ ...params, limit })}
            >
              {limit}
            </OptionPill>
          ))}
        </div>
      </div>

      {isEmbedded ? (
        <div className="space-y-3 pt-1">
          <button
            type="button"
            onClick={onSubmit}
            disabled={isSyncing || !params.keywords.trim()}
            className={cn(
              "flex w-full items-center justify-center gap-2.5 rounded-xl py-3.5 text-[14px] font-semibold tracking-[-0.01em] transition-all",
              "bg-primary text-primary-foreground shadow-[0_4px_14px_rgb(37_99_235_/_0.3)] hover:brightness-105 active:scale-[0.99]",
              "disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100",
            )}
          >
            {isSyncing ? (
              <>
                <Loader2 className="size-4 animate-spin" strokeWidth={2.25} />
                Importing roles…
              </>
            ) : (
              <>
                <LinkedInIcon className="size-4" />
                Start import
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-end gap-3 pt-1">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isSyncing}
              className="text-[12px] font-medium text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
            >
              Cancel
            </button>
          )}
          <button
            type="button"
            onClick={onSubmit}
            disabled={isSyncing || !params.keywords.trim()}
            className="text-[12px] font-semibold text-primary transition-opacity hover:opacity-80 disabled:opacity-50"
          >
            {isSyncing ? "Importing…" : "Start import"}
          </button>
        </div>
      )}
    </div>
  );
}

export function LinkedInSyncFlow({
  variant = "embedded",
  isRunning = false,
  onStart,
  keywordSuggestions,
  className,
}: LinkedInSyncFlowProps) {
  const [showConfig, setShowConfig] = useState(false);
  const [params, setParams] = useState<LinkedInSyncParams>(DEFAULT_LINKEDIN_SYNC);
  const containerRef = useRef<HTMLDivElement>(null);
  const isCompact = variant === "compact";

  useEffect(() => {
    if (!showConfig || !isCompact) return;

    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setShowConfig(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setShowConfig(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [showConfig, isCompact]);

  function handleSubmit() {
    if (!params.keywords.trim() || isRunning) return;
    onStart({
      ...params,
      keywords: params.keywords.trim(),
    });
    if (isCompact) setShowConfig(false);
  }

  if (isCompact) {
    return (
      <div ref={containerRef} className={cn("relative", className)}>
        <LinkedInSyncButton
          variant="compact"
          isLoading={isRunning}
          onClick={() => {
            if (isRunning) return;
            setShowConfig((current) => !current);
          }}
        />

        {showConfig && !isRunning && (
          <div className="absolute top-[calc(100%+8px)] right-0 z-40 w-[min(100vw-2rem,320px)]">
            <LinkedInSyncConfigPanel
              layout="dropdown"
              params={params}
              onChange={setParams}
              onCancel={() => setShowConfig(false)}
              onSubmit={handleSubmit}
              isSyncing={isRunning}
              keywordSuggestions={keywordSuggestions}
              className="shadow-[0_12px_40px_-12px_rgba(0,0,0,0.18)]"
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      <LinkedInSyncConfigPanel
        layout="embedded"
        params={params}
        onChange={setParams}
        onSubmit={handleSubmit}
        isSyncing={isRunning}
        keywordSuggestions={keywordSuggestions}
      />
    </div>
  );
}
