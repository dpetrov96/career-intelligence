"use client";

import { useEffect, useMemo, useRef } from "react";

import { ChatMarkdown } from "@/components/chat/chat-markdown";
import { MatchJobChips } from "@/components/chat/match-job-chips";
import { ChatTypingIndicator } from "@/components/chat/chat-typing-indicator";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/types/chat";

interface ChatMessageListProps {
  messages: ChatMessage[];
  isTyping?: boolean;
  selectedJobId?: number | null;
  onSelectJob?: (jobId: number) => void;
}

function MessageBody({
  content,
  inverted = false,
}: {
  content: string;
  inverted?: boolean;
}) {
  return <ChatMarkdown content={content} inverted={inverted} />;
}

function MessageBubble({
  role,
  children,
  wide = false,
}: {
  role: "user" | "assistant";
  children: React.ReactNode;
  wide?: boolean;
}) {
  const isUser = role === "user";

  return (
    <div
      className={cn(
        "relative px-3.5 py-2.5 sm:px-4 sm:py-3",
        wide
          ? "w-full max-w-[min(100%,32rem)] sm:max-w-[min(100%,36rem)]"
          : "max-w-[min(100%,20rem)] sm:max-w-[min(100%,24rem)]",
        isUser
          ? "chat-bubble-user rounded-[20px] rounded-br-[8px] text-white"
          : "chat-bubble-assistant rounded-[20px] rounded-bl-[8px]",
      )}
    >
      {children}
    </div>
  );
}

export function ChatMessageList({
  messages,
  isTyping = false,
  selectedJobId = null,
  onSelectJob,
}: ChatMessageListProps) {
  const endRef = useRef<HTMLDivElement>(null);
  const hasContent = messages.length > 0 || isTyping;

  useEffect(() => {
    if (!hasContent) return;

    const node = endRef.current;
    if (!node) return;

    requestAnimationFrame(() => {
      node.scrollIntoView({ behavior: "smooth", block: "end" });
    });
  }, [messages, isTyping, hasContent]);

  const containerClass = useMemo(
    () =>
      hasContent
        ? "px-4 pb-4 pt-4 sm:px-10 sm:pb-6 sm:pt-8"
        : "px-4 pb-4 pt-4 sm:px-10 sm:pb-6 sm:pt-10",
    [hasContent],
  );

  return (
    <div className={containerClass}>
      <div className="mx-auto w-full max-w-2xl space-y-3 sm:space-y-4">
        {messages.map((message) => {
          const isUser = message.role === "user";

          return (
            <article
              key={message.id}
              className={cn("flex w-full", isUser ? "justify-end" : "justify-start")}
            >
              <MessageBubble
                role={message.role}
                wide={message.type === "job_chips"}
              >
                {isUser ? (
                  <p className="whitespace-pre-wrap text-[14px] leading-[1.55] text-white sm:text-[15px]">
                    {message.type === "text" ? message.content : ""}
                  </p>
                ) : message.type === "text" ? (
                  <MessageBody content={message.content} />
                ) : (
                  <MatchJobChips
                    jobs={message.jobs}
                    selectedJobId={selectedJobId}
                    onSelectJob={onSelectJob}
                  />
                )}
              </MessageBubble>
            </article>
          );
        })}

        {isTyping && (
          <article className="flex w-full justify-start">
            <MessageBubble role="assistant">
              <ChatTypingIndicator />
            </MessageBubble>
          </article>
        )}

        <div ref={endRef} className="h-px shrink-0" aria-hidden />
      </div>
    </div>
  );
}
