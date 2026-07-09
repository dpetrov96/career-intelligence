"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { sendChatMessage } from "@/lib/api/chat";
import { fetchSessionMessages, seedSessionWelcome } from "@/lib/api/sessions";
import { parseStoredChatMessage } from "@/lib/parse-chat-message";
import type { ChatMessage } from "@/types/chat";

function toClientMessage(
  message: Awaited<ReturnType<typeof fetchSessionMessages>>[number],
): ChatMessage {
  return parseStoredChatMessage(message);
}

interface WelcomeContext {
  jobId: number;
  matchCount: number;
  matchScore?: number | null;
}

export function useChat(
  sessionId: number | null,
  selectedJobId: number | null,
  welcomeContext: WelcomeContext | null,
) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isTypingWelcome, setIsTypingWelcome] = useState(false);
  const welcomeSeededRef = useRef<number | null>(null);

  useEffect(() => {
    welcomeSeededRef.current = null;
  }, [sessionId]);

  useEffect(() => {
    if (sessionId === null) {
      setMessages([]);
      setInput("");
      setIsTypingWelcome(false);
      return;
    }

    const activeId = sessionId;
    let cancelled = false;

    async function loadHistory() {
      setIsLoadingHistory(true);
      try {
        const stored = await fetchSessionMessages(activeId);
        if (!cancelled) {
          setMessages(stored.map(toClientMessage));
        }
      } catch {
        if (!cancelled) setMessages([]);
      } finally {
        if (!cancelled) setIsLoadingHistory(false);
      }
    }

    void loadHistory();
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  useEffect(() => {
    if (
      sessionId === null ||
      isLoadingHistory ||
      !welcomeContext ||
      messages.length > 0
    ) {
      return;
    }

    if (welcomeSeededRef.current === sessionId) return;
    welcomeSeededRef.current = sessionId;

    let cancelled = false;
    setIsTypingWelcome(true);

    const typingTimer = setTimeout(() => {
      void (async () => {
        try {
          const welcome = await seedSessionWelcome(sessionId, {
            job_id: welcomeContext.jobId,
            match_count: welcomeContext.matchCount,
            match_score: welcomeContext.matchScore,
          });
          if (!cancelled) {
            setMessages(welcome.messages.map((message) => parseStoredChatMessage(message)));
          }
        } catch {
        } finally {
          if (!cancelled) setIsTypingWelcome(false);
        }
      })();
    }, 700);

    return () => {
      cancelled = true;
      clearTimeout(typingTimer);
      setIsTypingWelcome(false);
    };
  }, [sessionId, isLoadingHistory, welcomeContext, messages.length]);

  const showEmptyHero = messages.length === 0 && !isLoadingHistory && !isTypingWelcome;

  const send = useCallback(
    async (text?: string) => {
      const content = (text ?? input).trim();
      if (!content || isSending || sessionId === null) return;

      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "user", type: "text", content },
      ]);
      setInput("");
      setIsSending(true);

      await new Promise((resolve) => setTimeout(resolve, 450));

      try {
        const result = await sendChatMessage({
          message: content,
          session_id: sessionId,
          job_id: selectedJobId,
        });

        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            type: "text",
            content: result.reply,
          },
        ]);
      } catch (error) {
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            type: "text",
            content:
              error instanceof Error
                ? `Could not reach the API: ${error.message}`
                : "Could not reach the API.",
          },
        ]);
      } finally {
        setIsSending(false);
      }
    },
    [input, isSending, selectedJobId, sessionId],
  );

  return {
    messages,
    input,
    setInput,
    send,
    showEmptyHero,
    isSending,
    isLoadingHistory,
    isTypingWelcome,
  };
}
