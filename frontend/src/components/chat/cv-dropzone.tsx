"use client";

import { FileText, Upload } from "lucide-react";
import { useRef, useState } from "react";

import { cn } from "@/lib/utils";

const ACCEPT = ".pdf,.doc,.docx,.txt";
const MAX_MB = 10;

interface CvDropzoneProps {
  fileName: string | null;
  onFileSelect: (file: File) => void;
  onFileClear: () => void;
  className?: string;
}

export function CvDropzone({
  fileName,
  onFileSelect,
  onFileClear,
  className,
}: CvDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  function handleFiles(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    if (file.size > MAX_MB * 1024 * 1024) return;
    onFileSelect(file);
  }

  if (fileName) {
    return (
      <div
        className={cn(
          "flex w-full items-center gap-3 border border-border px-3 py-3 sm:px-4 sm:py-3.5",
          className,
        )}
      >
        <FileText
          className="size-4 shrink-0 text-muted-foreground"
          strokeWidth={1.5}
        />
        <div className="min-w-0 flex-1 text-left">
          <p className="truncate text-sm font-medium text-foreground">
            {fileName}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Ready — pick a role and ask
          </p>
        </div>
        <button
          type="button"
          onClick={onFileClear}
          className="shrink-0 min-h-9 px-1 text-xs text-muted-foreground transition-colors active:text-primary"
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
        "group flex w-full cursor-pointer flex-col items-center border border-dashed px-4 py-7 text-center transition-colors active:border-foreground/25 sm:px-6 sm:py-10",
        isDragging
          ? "border-primary text-primary"
          : "border-border",
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

      <Upload
        className={cn(
          "mb-2.5 size-5 transition-colors sm:mb-3",
          isDragging
            ? "text-primary"
            : "text-muted-foreground group-active:text-foreground",
        )}
        strokeWidth={1.5}
      />

      <p className="text-sm font-medium text-foreground">
        {isDragging ? (
          "Release to upload"
        ) : (
          <>
            <span className="sm:hidden">Tap to upload your CV</span>
            <span className="hidden sm:inline">Drop your CV here</span>
          </>
        )}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        <span className="sm:hidden">PDF, DOCX, TXT · {MAX_MB} MB max</span>
        <span className="hidden sm:inline">
          or{" "}
          <span className="text-foreground underline-offset-2 group-hover:underline">
            browse files
          </span>
          {" · "}
          PDF, DOCX, TXT · {MAX_MB} MB max
        </span>
      </p>
    </div>
  );
}
