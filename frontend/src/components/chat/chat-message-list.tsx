"use client";

import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/types/chat";

interface ChatMessageListProps {
  messages: ChatMessage[];
}

export function ChatMessageList({ messages }: ChatMessageListProps) {
  return (
    <div className="px-4 pb-4 pt-4 sm:px-10 sm:pb-6 sm:pt-10">
      <div className="mx-auto w-full max-w-2xl space-y-6 sm:space-y-8">
        {messages.map((message) => (
          <article
            key={message.id}
            className={cn(message.role === "user" && "flex justify-end")}
          >
            <div
              className={cn(
                "max-w-[92%] text-[15px] leading-7 sm:max-w-[85%]",
                message.role === "user"
                  ? "border border-border px-3.5 py-2.5 text-foreground sm:px-4"
                  : "text-foreground",
              )}
            >
              {message.content}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
