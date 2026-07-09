"use client";

import { ChatHeroSteps } from "@/components/chat/chat-hero-steps";
import { CvDropzone } from "@/components/chat/cv-dropzone";

interface ChatEmptyStateProps {
  resumeFileName: string | null;
  onFileSelect: (file: File) => void;
  onFileClear: () => void;
}

export function ChatEmptyState({
  resumeFileName,
  onFileSelect,
  onFileClear,
}: ChatEmptyStateProps) {
  return (
    <div className="relative z-10 w-full px-4 py-5 sm:flex sm:min-h-[calc(100dvh-12rem)] sm:flex-col sm:items-center sm:justify-center sm:px-8 sm:py-10">
      <div className="mx-auto flex w-full max-w-xl flex-col items-center text-center">
        <h1
          className="hero-fade-up text-[28px] font-semibold leading-[1.08] tracking-[-0.04em] sm:text-[48px] sm:leading-[1.05]"
          style={{ animationDelay: "0ms" }}
        >
          <span className="hero-gradient-text">Career fit</span>{" "}
          <span className="text-foreground">analysis</span>
        </h1>

        <p
          className="hero-fade-up mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground sm:mt-4 sm:text-base"
          style={{ animationDelay: "60ms" }}
        >
          Upload your CV and compare against open roles.
        </p>

        <div
          className="hero-fade-up mt-5 w-full sm:mt-8"
          style={{ animationDelay: "120ms" }}
        >
          <CvDropzone
            fileName={resumeFileName}
            onFileSelect={onFileSelect}
            onFileClear={onFileClear}
          />
        </div>

        <div className="hidden sm:block">
          <ChatHeroSteps />
        </div>
      </div>
    </div>
  );
}
