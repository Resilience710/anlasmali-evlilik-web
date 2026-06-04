"use client";

import { Heart } from "lucide-react";
import { useTransition } from "react";
import { toggleFavoriteAction } from "@/app/_actions/engagement";
import { cn } from "@/lib/utils";

export function FavoriteButton({
  listingId,
  isFavorited,
  className,
}: {
  listingId: string;
  isFavorited: boolean;
  className?: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(() => toggleFavoriteAction(listingId))}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg border px-4 h-10 text-sm font-medium transition-colors cursor-pointer disabled:opacity-60",
        isFavorited
          ? "border-primary/40 bg-primary-soft text-primary"
          : "border-border hover:bg-elevated",
        className
      )}
    >
      <Heart className={cn("size-4", isFavorited && "fill-primary")} />
      {isFavorited ? "Favorilerde" : "Favorile"}
    </button>
  );
}
