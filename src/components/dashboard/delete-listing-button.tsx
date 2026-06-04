"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteListingAction } from "@/app/_actions/listings";

export function DeleteListingButton({ listingId }: { listingId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (confirm("Bu ilanı silmek istediğinize emin misiniz?")) {
          startTransition(() => deleteListingAction(listingId));
        }
      }}
      className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border px-3 text-sm text-muted-foreground transition-colors hover:border-destructive/40 hover:text-destructive disabled:opacity-50 cursor-pointer"
    >
      <Trash2 className="size-4" />
      Sil
    </button>
  );
}
