"use client";

import { ContextPanelContent } from "@/components/jobs/context-panel-content";

interface RightPanelProps {
  selectedJobId: number | null;
  onSelectJob: (id: number) => void;
}

export function RightPanel({ selectedJobId, onSelectJob }: RightPanelProps) {
  return (
    <aside className="hidden min-h-0 w-[380px] shrink-0 flex-col border-l border-border bg-surface lg:flex xl:w-[420px]">
      <ContextPanelContent
        selectedJobId={selectedJobId}
        onSelectJob={onSelectJob}
      />
    </aside>
  );
}
