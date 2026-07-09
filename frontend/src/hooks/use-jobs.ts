"use client";

import { useCallback, useEffect, useState } from "react";

import { fetchJobs } from "@/lib/api/jobs";
import type { JobPosting } from "@/lib/api/types";

export function useJobs(sessionId: number | null) {
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchJobs(sessionId);
      setJobs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load jobs");
      setJobs([]);
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    void load();
  }, [load]);

  return { jobs, isLoading, error, reload: load };
}
