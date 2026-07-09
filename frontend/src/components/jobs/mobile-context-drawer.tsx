"use client";

import { useEffect } from "react";

import { ContextPanelContent } from "@/components/jobs/context-panel-content";
import { cn } from "@/lib/utils";

interface MobileContextDrawerProps {
  open: boolean;
  onClose: () => void;
  selectedJobId: number | null;
  onSelectJob: (id: number) => void;
}

export function MobileContextDrawer({
  open,
  onClose,
  selectedJobId,
  onSelectJob,
}: MobileContextDrawerProps) {
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  return (
    <>
      <button
        type="button"
        aria-label="Close positions panel"
        onClick={onClose}
        className={cn(
          "fixed inset-0 z-40 bg-stone-900/30 transition-opacity duration-300 lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Positions"
        aria-hidden={!open}
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex w-full max-w-none flex-col bg-surface shadow-[-8px_0_32px_-12px_rgba(0,0,0,0.15)] transition-transform duration-300 ease-out sm:max-w-sm lg:hidden",
          open ? "translate-x-0" : "pointer-events-none translate-x-full",
        )}
      >
        <ContextPanelContent
          selectedJobId={selectedJobId}
          onSelectJob={onSelectJob}
          onJobSelected={onClose}
          onClose={onClose}
        />
      </aside>
    </>
  );
}
