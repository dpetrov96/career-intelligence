import type { JobPosting } from "@/lib/jobs";

export function bestMatchJobId(jobs: JobPosting[]): number | null {
  if (jobs.length === 0) return null;

  const withScore = jobs.filter((job) => job.match_score != null);
  if (withScore.length > 0) {
    return withScore.reduce((best, job) =>
      (job.match_score ?? 0) > (best.match_score ?? 0) ? job : best,
    ).id;
  }

  return jobs[0].id;
}
