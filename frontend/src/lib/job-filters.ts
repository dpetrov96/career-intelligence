import type { JobPosting } from "@/lib/jobs";

export type TypeFilter = "all" | JobPosting["type"];
export type CompanyFilter = "all" | string;

export const TYPE_FILTER_OPTIONS: { value: TypeFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "Remote", label: "Remote" },
  { value: "Hybrid", label: "Hybrid" },
  { value: "On-site", label: "On-site" },
];

export function filterJobs(
  jobs: JobPosting[],
  typeFilter: TypeFilter,
  companyFilter: CompanyFilter,
): JobPosting[] {
  return jobs.filter((job) => {
    if (typeFilter !== "all" && job.type !== typeFilter) return false;
    if (companyFilter !== "all" && job.company !== companyFilter) return false;
    return true;
  });
}

export function getUniqueCompanies(jobs: JobPosting[]): string[] {
  return [...new Set(jobs.map((job) => job.company))].sort((a, b) =>
    a.localeCompare(b),
  );
}
