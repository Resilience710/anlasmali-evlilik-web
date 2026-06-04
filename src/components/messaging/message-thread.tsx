"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Send } from "lucide-react";
import { replyAction } from "@/app/_actions/messages";
import {
  useConversationMessages,
  type ThreadMessage,
} from "@/hooks/use-conversation-messages";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function clock(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
}

export function MessageThread({
  conversationId,
  meId,
  initialMessages,
}: {
  conversationId: string;
  meId: string;
  initialMessages: ThreadMessage[];
}) {
  const { messages, refetch } = useConversationMessages(
    conversationId,
    initialMessages
  );
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function send(e: React.FormEvent) {
    e.preventDefault();
    const body = text.trim();
    if (!body) return;
    setText("");
    setError(null);
    start(async () => {
      const fd = new FormData();
      fd.set("body", body);
      const res = await replyAction(conversationId, {}, fd);
      if (res?.error) setError(res.error);
      await refetch();
    });
  }

  return (
    <div className="flex h-[60vh] flex-col rounded-[var(--radius-card)] border border-border bg-surface">
      <div className="flex-1 space-y-2 overflow-y-auto scroll-thin p-4">
        {messages.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Henüz mesaj yok. İlk mesajı siz yazın.
          </p>
        ) : (
          messages.map((m) => {
            const mine = m.senderId === meId;
            return (
              <div
                key={m.id}
                className={cn("flex", mine ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "max-w-[75%] rounded-2xl px-3.5 py-2 text-sm",
                    mine
                      ? "rounded-br-sm bg-primary text-primary-foreground"
                      : "rounded-bl-sm bg-elevated text-foreground"
                  )}
                >
                  <p className="whitespace-pre-wrap break-words">{m.body}</p>
                  <span
                    className={cn(
                      "mt-1 block text-right text-[0.65rem]",
                      mine ? "text-primary-foreground/70" : "text-muted-foreground"
                    )}
                  >
                    {clock(m.createdAt)}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={endRef} />
      </div>

      <form
        onSubmit={send}
        className="flex items-end gap-2 border-t border-border p-3"
      >
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send(e);
            }
          }}
          rows={1}
          placeholder="Mesajınızı yazın..."
          className="max-h-32 min-h-10 flex-1 resize-none rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm focus-visible:border-primary focus-visible:outline-none"
        />
        <Button type="submit" size="icon" disabled={pending}>
          <Send className="size-4" />
        </Button>
      </form>
      {error && <p className="px-4 pb-2 text-xs text-destructive">{error}</p>}
    </div>
  );
}
