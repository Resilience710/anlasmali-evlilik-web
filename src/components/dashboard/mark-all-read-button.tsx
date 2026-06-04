"use client";

import { useTransition } from "react";
import { CheckCheck } from "lucide-react";
import { markAllNotificationsReadAction } from "@/app/_actions/engagement";

export function MarkAllReadButton() {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(() => markAllNotificationsReadAction())}
      className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border px-3 text-sm transition-colors hover:bg-elevated disabled:opacity-50 cursor-pointer"
    >
      <CheckCheck className="size-4" />
      Tümünü okundu işaretle
    </button>
  );
}
