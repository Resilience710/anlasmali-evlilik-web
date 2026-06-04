import { Users } from "lucide-react";
import { formatCount } from "@/lib/utils";

export function OnlineCard({ online }: { online: number }) {
  return (
    <div className="flex flex-col items-center justify-center gap-1.5 rounded-[var(--radius-card)] border border-border bg-surface p-6 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-soft text-primary">
        <Users className="size-6" />
      </span>
      <span className="mt-1 text-sm text-muted-foreground">
        Şu anda sitemizde
      </span>
      <span className="text-4xl font-extrabold text-primary">
        {formatCount(online)}
      </span>
      <span className="text-sm font-medium">kişi aktif</span>
      <span className="mt-0.5 inline-flex items-center gap-1.5 text-xs text-success">
        <span className="h-2 w-2 rounded-full bg-success" />
        Online
      </span>
    </div>
  );
}
