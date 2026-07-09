"use client";

import { useState } from "react";

import { ChatPanel } from "@/components/chat/chat-panel";
import { MobileContextDrawer } from "@/components/jobs/mobile-context-drawer";
import { RightPanel } from "@/components/jobs/right-panel";

export function CareerAssistant() {
  const [selectedJobId, setSelectedJobId] = useState<number | null>(1);
  const [contextOpen, setContextOpen] = useState(false);
  const [resumeFileName, setResumeFileName] = useState<string | null>(null);

  return (
    <div className="flex h-dvh bg-background">
      <ChatPanel
        resumeFileName={resumeFileName}
        onResumeSelect={(file) => setResumeFileName(file.name)}
        onResumeClear={() => setResumeFileName(null)}
        onOpenContext={() => setContextOpen(true)}
        className="min-h-0 min-w-0 flex-1"
      />

      <RightPanel
        selectedJobId={selectedJobId}
        onSelectJob={setSelectedJobId}
      />

      <MobileContextDrawer
        open={contextOpen}
        onClose={() => setContextOpen(false)}
        selectedJobId={selectedJobId}
        onSelectJob={setSelectedJobId}
      />
    </div>
  );
}
