"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  fetchLinkedInSyncStatus,
  startLinkedInSync,
  stopLinkedInSync,
} from "@/lib/api/jobs";
import type { LinkedInSyncStatus } from "@/lib/api/types";
import type { LinkedInSyncParams } from "@/lib/linkedin-sync";

const IDLE_STATUS: LinkedInSyncStatus = {
  sync_id: null,
  status: "idle",
  keywords: null,
  location: null,
  geo_id: null,
  limit: null,
  phase: null,
  current: 0,
  total: 0,
  imported: 0,
  skipped: 0,
  current_item: null,
  message: null,
  blocked: false,
  running: false,
  job_ids: [],
};

const MATCH_PHASE_MS = 2000;

export function useLinkedInSync(onJobsUpdated?: () => void | Promise<void>) {
  const [status, setStatus] = useState<LinkedInSyncStatus>(IDLE_STATUS);
  const [isMatching, setIsMatching] = useState(false);
  const onJobsUpdatedRef = useRef(onJobsUpdated);
  const wasRunningRef = useRef(false);
  const matchingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastImportedRef = useRef(0);

  useEffect(() => {
    onJobsUpdatedRef.current = onJobsUpdated;
  }, [onJobsUpdated]);

  const clearMatchingTimer = useCallback(() => {
    if (matchingTimerRef.current) {
      clearTimeout(matchingTimerRef.current);
      matchingTimerRef.current = null;
    }
  }, []);

  const beginMatchingPhase = useCallback(
    async (importedCount: number) => {
      if (importedCount <= 0) return;

      clearMatchingTimer();
      setIsMatching(true);
      lastImportedRef.current = importedCount;

      try {
        await onJobsUpdatedRef.current?.();
      } catch {
        /* reload is best-effort */
      }

      matchingTimerRef.current = setTimeout(() => {
        setIsMatching(false);
        matchingTimerRef.current = null;
      }, MATCH_PHASE_MS);
    },
    [clearMatchingTimer],
  );

  useEffect(() => {
    return () => clearMatchingTimer();
  }, [clearMatchingTimer]);

  const poll = useCallback(async () => {
    const next = await fetchLinkedInSyncStatus();
    setStatus(next);
    return next;
  }, []);

  useEffect(() => {
    void poll();
  }, [poll]);

  useEffect(() => {
    if (!status.running) return;

    const interval = setInterval(() => {
      void poll();
    }, 1200);

    return () => clearInterval(interval);
  }, [status.running, poll]);

  useEffect(() => {
    const wasRunning = wasRunningRef.current;
    wasRunningRef.current = status.running;

    if (!wasRunning || status.running) return;

    const importedCount = Math.max(status.imported, lastImportedRef.current);
    if (importedCount > 0) {
      void beginMatchingPhase(importedCount);
      return;
    }

    void onJobsUpdatedRef.current?.();
  }, [status.running, status.imported, beginMatchingPhase]);

  const start = useCallback(async (params: LinkedInSyncParams) => {
    clearMatchingTimer();
    setIsMatching(false);
    lastImportedRef.current = 0;
    const next = await startLinkedInSync(params);
    setStatus(next);
    return next;
  }, [clearMatchingTimer]);

  const stop = useCallback(async () => {
    const next = await stopLinkedInSync();
    setStatus(next);
    return next;
  }, []);

  const isRunning = status.running;
  const isFinished =
    !status.running &&
    status.sync_id !== null &&
    ["completed", "stopped", "blocked", "failed"].includes(status.status);

  return {
    status,
    isRunning,
    isMatching,
    isFinished,
    start,
    stop,
    refreshStatus: poll,
  };
}
