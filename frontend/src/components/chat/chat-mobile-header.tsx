"use client";

import { PanelRight, Plus } from "lucide-react";
import Link from "next/link";

import type { ChatSession } from "@/lib/api/sessions";
import { HOME, sessionPath } from "@/lib/routes";

interface ChatMobileHeaderProps {
  sessions: ChatSession[];
  activeSessionId: number | null;
  onOpenContext?: () => void;
  showRolesPanel?: boolean;
}

export function ChatMobileHeader({
  sessions,
  activeSessionId,
  onOpenContext,
  showRolesPanel = false,
}: ChatMobileHeaderProps) {
  const activeSession =
    sessions.find((session) => session.id === activeSessionId) ?? null;

  return (
    <header className="glass-bar flex shrink-0 items-center justify-between gap-2 border-b px-3 pb-2.5 pt-[max(0.625rem,env(safe-area-inset-top))] lg:hidden">
      <div className="flex min-w-0 items-center gap-2">
        <Link
          href={HOME}
          className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-border/80 bg-white/80 text-foreground shadow-sm"
          aria-label="New analysis"
        >
          <Plus className="size-4" strokeWidth={1.75} />
        </Link>

        {sessions.length > 0 ? (
          <select
            value={activeSessionId ?? ""}
            onChange={(event) => {
              const value = event.target.value;
              if (value) {
                window.location.href = sessionPath(Number(value));
              }
            }}
            className="max-w-[140px] truncate rounded-xl border border-border/80 bg-white/80 px-2 py-1.5 text-xs font-medium text-foreground shadow-sm"
          >
            {!activeSessionId && (
              <option value="" disabled>
                Select session
              </option>
            )}
            {sessions.map((session) => (
              <option key={session.id} value={session.id}>
                {session.resume_filename}
              </option>
            ))}
          </select>
        ) : (
          <span className="truncate text-sm font-semibold tracking-[-0.02em] text-foreground">
            {activeSession?.resume_filename ?? "New analysis"}
          </span>
        )}
      </div>

      {showRolesPanel && (
        <button
          type="button"
          onClick={onOpenContext}
          className="inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-full bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground shadow-[0_4px_12px_rgb(37_99_235_/_0.28)] transition-all active:scale-[0.98]"
          aria-label="Open roles"
        >
          <PanelRight className="size-3.5" strokeWidth={1.75} />
          Roles
        </button>
      )}
    </header>
  );
}
