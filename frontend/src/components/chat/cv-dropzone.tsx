"use client";

import { CheckCircle2, FileText, Loader2, Upload } from "lucide-react";
import { useRef, useState } from "react";

import { cn } from "@/lib/utils";

const ACCEPT = ".pdf,.doc,.docx,.txt";
const MAX_MB = 10;

interface CvDropzoneProps {
  fileName: string | null;
  isUploading?: boolean;
  onFileSelect: (file: File) => void;
  onFileClear?: () => void;
  className?: string;
}

export function CvDropzone({
  fileName,
  isUploading = false,
  onFileSelect,
  onFileClear,
  className,
}: CvDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  function handleFiles(files: FileList | null) {
    if (isUploading) return;
    const file = files?.[0];
    if (!file) return;
    if (file.size > MAX_MB * 1024 * 1024) return;
    onFileSelect(file);
  }

  if (isUploading) {
    return (
      <div
        className={cn(
          "dropzone-shell flex w-full flex-col items-center rounded-2xl px-4 py-8 text-center sm:px-6 sm:py-10",
          className,
        )}
      >
        <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-primary/10">
          <Loader2
            className="size-5 animate-spin text-primary"
            strokeWidth={2}
          />
        </div>
        <p className="text-sm font-semibold text-foreground">
          Analyzing your CV…
        </p>
        <p className="mt-1.5 text-xs text-muted-foreground">
          Extracting text, indexing skills, and preparing your session
        </p>
        <div className="mt-5 flex items-center gap-1.5">
          {[0, 1, 2].map((index) => (
            <span
              key={index}
              className="typing-dot size-2 rounded-full bg-primary/55"
              style={{ animationDelay: `${index * 160}ms` }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (fileName) {
    return (
      <div
        className={cn(
          "flex w-full items-center gap-3 rounded-2xl border border-border/80 bg-white px-4 py-3.5 shadow-[var(--shadow-soft)] sm:py-4",
          className,
        )}
      >
        <div className="flex size-10 items-center justify-center rounded-xl bg-accent">
          <FileText className="size-5 text-primary" strokeWidth={1.75} />
        </div>
        <div className="min-w-0 flex-1 text-left">
          <p className="truncate text-sm font-semibold text-foreground">
            {fileName}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Indexed for analysis
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            if (onFileClear) {
              onFileClear();
            } else {
              inputRef.current?.click();
            }
          }}
          className="shrink-0 rounded-lg px-2 py-1 text-xs font-medium text-primary transition-colors hover:bg-accent"
        >
          Replace
        </button>
      </div>
    );
  }

  return (
    <div
      role="button"
      tabIndex={0}
      data-dragging={isDragging}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          inputRef.current?.click();
        }
      }}
      onDragEnter={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        setIsDragging(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        handleFiles(e.dataTransfer.files);
      }}
      className={cn(
        "dropzone-shell group flex w-full cursor-pointer flex-col items-center rounded-2xl px-4 py-8 text-center transition-all sm:px-6 sm:py-10",
        className,
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />

      <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-accent transition-colors group-hover:bg-brand-light">
        <Upload
          className={cn(
            "size-5 transition-colors",
            isDragging ? "text-primary" : "text-primary/80",
          )}
          strokeWidth={1.75}
        />
      </div>

      <p className="text-sm font-semibold text-foreground">
        {isDragging ? "Release to upload" : "Drop your CV here"}
      </p>
      <p className="mt-1.5 text-xs text-muted-foreground">
        or browse · PDF, DOCX, TXT · {MAX_MB} MB max
      </p>
    </div>
  );
}
