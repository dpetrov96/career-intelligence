"use client";

import { useState } from "react";

import type { ChatMessage } from "@/types/chat";

const MOCK_ASSISTANT_REPLY =
  "Document analysis is coming soon. Once your files are uploaded, answers will be grounded in your resume and job postings.";

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");

  const isInitialState = messages.length === 0;

  function send(text?: string) {
    const content = (text ?? input).trim();
    if (!content) return;

    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: "user", content },
    ]);
    setInput("");

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: MOCK_ASSISTANT_REPLY,
        },
      ]);
    }, 500);
  }

  return {
    messages,
    input,
    setInput,
    send,
    isInitialState,
  };
}
