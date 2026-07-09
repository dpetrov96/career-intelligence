"use client";

import { useCallback, useEffect, useState } from "react";

import { fetchSessions, type ChatSession } from "@/lib/api/sessions";

export function useSessions(routeSessionId: number | null) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const reload = useCallback(async () => {
    const next = await fetchSessions();
    setSessions(next);
    return next;
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      setIsLoading(true);
      try {
        await reload();
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void init();
    return () => {
      cancelled = true;
    };
  }, [reload]);

  const activeSession =
    routeSessionId !== null
      ? (sessions.find((session) => session.id === routeSessionId) ?? null)
      : null;

  return {
    sessions,
    activeSessionId: routeSessionId,
    activeSession,
    isLoading,
    reload,
  };
}
