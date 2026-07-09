"use client";

import { cn } from "@/lib/utils";

export function ChatTypingIndicator({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-1.5 px-0.5 py-1", className)}>
      {[0, 1, 2].map((index) => (
        <span
          key={index}
          className="typing-dot size-2 rounded-full bg-primary/55"
          style={{ animationDelay: `${index * 160}ms` }}
        />
      ))}
    </div>
  );
}
