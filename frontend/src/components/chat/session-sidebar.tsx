"use client";

import { ChevronLeft, ChevronRight, FileText, Plus } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import type { ChatSession } from "@/lib/api/sessions";
import { HOME, sessionPath } from "@/lib/routes";
import { cn } from "@/lib/utils";

interface SessionSidebarProps {
  sessions: ChatSession[];
  activeSessionId: number | null;
  className?: string;
}

const STORAGE_KEY = "career-intelligence:sidebar-collapsed";

function formatSessionDate(value: string): string {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

export function SessionSidebar({
  sessions,
  activeSessionId,
  className,
}: SessionSidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "true") setCollapsed(true);
  }, []);

  function toggleCollapsed() {
    setCollapsed((current) => {
      const next = !current;
      localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  }

  const isHome = pathname === HOME;

  return (
    <aside
      className={cn(
        "hidden shrink-0 flex-col border-r border-border/80 panel-shell transition-[width] duration-200 lg:flex",
        collapsed ? "w-[52px]" : "w-[260px]",
        className,
      )}
    >
      <div
        className={cn(
          "flex items-center border-b border-border px-2 py-2.5",
          collapsed ? "justify-center" : "justify-between gap-2 px-3",
        )}
      >
        {!collapsed && (
          <p className="truncate text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
            Sessions
          </p>
        )}
        <button
          type="button"
          onClick={toggleCollapsed}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          {collapsed ? (
            <ChevronRight className="size-4" strokeWidth={1.75} />
          ) : (
            <ChevronLeft className="size-4" strokeWidth={1.75} />
          )}
        </button>
      </div>

      <div className="p-2">
        <Link
          href={HOME}
          className={cn(
            "flex items-center rounded-xl border transition-all hover:bg-accent/80",
            collapsed
              ? "size-9 justify-center border-transparent"
              : "gap-2 border-border/80 px-3 py-2",
            isHome && "border-primary/25 bg-primary/5 shadow-sm",
          )}
          title="New analysis"
        >
          <Plus className="size-4 shrink-0" strokeWidth={1.75} />
          {!collapsed && (
            <span className="text-sm font-medium text-foreground">
              New analysis
            </span>
          )}
        </Link>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-3">
        {!collapsed && sessions.length > 0 && (
          <p className="px-2 pb-2 text-[10px] font-medium uppercase tracking-[0.08em] text-muted-foreground/70">
            CV sessions
          </p>
        )}

        <ul className="space-y-1">
          {sessions.map((session) => {
            const isActive = session.id === activeSessionId;
            const href = sessionPath(session.id);

            return (
              <li key={session.id}>
                <Link
                  href={href}
                  title={session.resume_filename}
                  className={cn(
                    "flex items-center rounded-xl transition-all hover:bg-accent/80",
                    collapsed
                      ? "size-9 justify-center"
                      : "gap-2.5 px-2.5 py-2",
                    isActive &&
                      "bg-gradient-to-r from-primary/10 to-transparent ring-1 ring-primary/20",
                  )}
                >
                  <FileText
                    className={cn(
                      "size-4 shrink-0",
                      isActive ? "text-primary" : "text-muted-foreground",
                    )}
                    strokeWidth={1.75}
                  />
                  {!collapsed && (
                    <span className="min-w-0 flex-1 text-left">
                      <span className="block truncate text-sm font-medium text-foreground">
                        {session.resume_filename}
                      </span>
                      <span className="block truncate text-[11px] text-muted-foreground">
                        {formatSessionDate(session.created_at)}
                        {session.message_count > 0 &&
                          ` · ${session.message_count} msgs`}
                      </span>
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}
