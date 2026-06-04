"use client";

import { useActionState } from "react";
import { Send } from "lucide-react";
import { sendMessageAction } from "@/app/_actions/messages";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export function MessageCompose({
  recipientId,
  recipientName,
}: {
  recipientId: string;
  recipientName: string;
}) {
  const [state, formAction, pending] = useActionState(sendMessageAction, {});

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="recipientId" value={recipientId} />
      {state.error && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}
      <Textarea
        name="body"
        required
        placeholder={`${recipientName} kişisine bir mesaj yazın...`}
        rows={4}
      />
      <Button type="submit" disabled={pending} className="self-end">
        <Send />
        {pending ? "Gönderiliyor..." : "Mesaj Gönder"}
      </Button>
    </form>
  );
}
