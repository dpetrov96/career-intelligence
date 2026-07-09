"use client";

import { JobPostingItem } from "@/components/jobs/job-posting-item";
import type { JobPosting } from "@/lib/jobs";

interface JobPostingListProps {
  jobs: JobPosting[];
  selectedJobId: number | null;
  onSelectJob: (id: number) => void;
}

export function JobPostingList({
  jobs,
  selectedJobId,
  onSelectJob,
}: JobPostingListProps) {
  return (
    <ul className="divide-y divide-border">
      {jobs.map((job) => (
        <JobPostingItem
          key={job.id}
          job={job}
          isSelected={selectedJobId === job.id}
          onSelect={onSelectJob}
        />
      ))}
    </ul>
  );
}
