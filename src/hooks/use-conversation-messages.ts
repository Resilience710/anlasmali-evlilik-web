"use client";

import { useCallback, useEffect, useState } from "react";
import { MESSAGE_POLL_INTERVAL_MS } from "@/lib/constants";

export type ThreadMessage = {
  id: string;
  senderId: string;
  body: string;
  createdAt: string;
};

/**
 * Konuşma mesajlarını canlı tutar.
 * - Supabase env'leri varsa Realtime (Postgres Changes) ile anlık güncelleme,
 * - aksi halde periyodik polling (fallback).
 */
export function useConversationMessages(
  conversationId: string,
  initial: ThreadMessage[],
  initialOtherLastRead: string | null = null
) {
  const [messages, setMessages] = useState<ThreadMessage[]>(initial);
  const [otherLastRead, setOtherLastRead] = useState<string | null>(
    initialOtherLastRead
  );

  const refetch = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/conversations/${conversationId}/messages`,
        { cache: "no-store" }
      );
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages as ThreadMessage[]);
        setOtherLastRead((data.otherLastRead as string | null) ?? null);
      }
    } catch {
      /* sessizce geç */
    }
  }, [conversationId]);

  useEffect(() => {
    let active = true;
    let interval: ReturnType<typeof setInterval> | undefined;
    let cleanupRealtime: (() => void) | undefined;

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (url && key) {
      import("@supabase/supabase-js")
        .then(({ createClient }) => {
          if (!active) return;
          const supabase = createClient(url, key);
          const channel = supabase
            .channel(`conv-${conversationId}`)
            .on(
              "postgres_changes",
              {
                event: "INSERT",
                schema: "public",
                table: "Message",
                filter: `conversationId=eq.${conversationId}`,
              },
              () => refetch()
            )
            .subscribe();
          cleanupRealtime = () => {
            supabase.removeChannel(channel);
          };
        })
        .catch(() => {});
      // Realtime'a ek olarak yavaş bir yedek polling
      interval = setInterval(refetch, 15000);
    } else {
      interval = setInterval(refetch, MESSAGE_POLL_INTERVAL_MS);
    }

    return () => {
      active = false;
      if (interval) clearInterval(interval);
      if (cleanupRealtime) cleanupRealtime();
    };
  }, [conversationId, refetch]);

  return { messages, otherLastRead, refetch };
}
