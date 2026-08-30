import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { MentorMessage } from "@/types";

const MSG_CACHE_KEY = "ulys-mentor-cache";

function getCachedMessages(): MentorMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(MSG_CACHE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setCachedMessages(messages: MentorMessage[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(MSG_CACHE_KEY, JSON.stringify(messages));
}

export function useMentorMessages() {
  const [messages, setMessages] = useState<MentorMessage[]>(() => getCachedMessages());
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.get<MentorMessage[]>("/api/mentor/messages");
      setMessages(data);
      setCachedMessages(data);
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const sendMessage = useCallback(
    async (content: string) => {
      const studentMsg: MentorMessage = {
        id: `local-${Date.now()}`,
        role: "student",
        content,
      };

      const next = [...messages, studentMsg];
      setMessages(next);
      setCachedMessages(next);
      setSending(true);

      try {
        const response = await api.post<MentorMessage>("/api/mentor/messages", { content });
        const finalMessages = [...messages, studentMsg, response];
        setMessages(finalMessages);
        setCachedMessages(finalMessages);
        return response;
      } catch {
        const errorMsg: MentorMessage = {
          id: `error-${Date.now()}`,
          role: "mentor",
          content: "Не удалось связаться с ULIE. Проверь подключение к интернету и попробуй ещё раз.",
        };
        const finalMessages = [...messages, studentMsg, errorMsg];
        setMessages(finalMessages);
        setCachedMessages(finalMessages);
      } finally {
        setSending(false);
      }
    },
    [messages]
  );

  return { messages, loading, sending, refresh: fetchMessages, sendMessage };
}
