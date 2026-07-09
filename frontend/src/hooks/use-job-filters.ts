"use client";

import { useMemo, useState } from "react";

import {
  type CompanyFilter,
  filterJobs,
  type TypeFilter,
} from "@/lib/job-filters";
import type { JobPosting } from "@/lib/jobs";

export function useJobFilters(jobs: JobPosting[]) {
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [companyFilter, setCompanyFilter] = useState<CompanyFilter>("all");

  const filteredJobs = useMemo(
    () => filterJobs(jobs, typeFilter, companyFilter),
    [jobs, typeFilter, companyFilter],
  );

  const isFiltered = typeFilter !== "all" || companyFilter !== "all";

  function clearFilters() {
    setTypeFilter("all");
    setCompanyFilter("all");
  }

  return {
    typeFilter,
    companyFilter,
    setTypeFilter,
    setCompanyFilter,
    filteredJobs,
    isFiltered,
    clearFilters,
  };
}
