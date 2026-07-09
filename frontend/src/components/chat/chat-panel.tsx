"use client";

import { ChatComposer } from "@/components/chat/chat-composer";
import { ChatEmptyState } from "@/components/chat/chat-empty-state";
import { ChatHeroBackground } from "@/components/chat/chat-hero-background";
import { ChatMessageList } from "@/components/chat/chat-message-list";
import { ChatMobileHeader } from "@/components/chat/chat-mobile-header";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChat } from "@/hooks/use-chat";
import { cn } from "@/lib/utils";

interface ChatPanelProps {
  resumeFileName: string | null;
  onResumeSelect: (file: File) => void;
  onResumeClear: () => void;
  onOpenContext?: () => void;
  className?: string;
}

export function ChatPanel({
  resumeFileName,
  onResumeSelect,
  onResumeClear,
  onOpenContext,
  className,
}: ChatPanelProps) {
  const { messages, input, setInput, send, isInitialState } = useChat();

  return (
    <section
      className={cn(
        "relative flex min-h-0 flex-col overflow-hidden bg-surface",
        className,
      )}
    >
      {isInitialState && (
        <ChatHeroBackground className="pointer-events-none absolute inset-0 overflow-hidden max-lg:opacity-80" />
      )}

      <ChatMobileHeader onOpenContext={onOpenContext} />

      <ScrollArea className="relative z-10 min-h-0 flex-1">
        <div className="flex min-h-full w-full flex-col">
          {isInitialState ? (
            <ChatEmptyState
              resumeFileName={resumeFileName}
              onFileSelect={onResumeSelect}
              onFileClear={onResumeClear}
            />
          ) : (
            <ChatMessageList messages={messages} />
          )}
        </div>
      </ScrollArea>

      <ChatComposer
        input={input}
        onInputChange={setInput}
        onSend={send}
        showSuggestions={isInitialState}
        resumeFileName={resumeFileName}
        showResumeHint={!isInitialState}
      />
    </section>
  );
}
