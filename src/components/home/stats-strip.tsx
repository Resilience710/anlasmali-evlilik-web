import { Users, UserCheck, FileText, HeartHandshake } from "lucide-react";
import { formatCount } from "@/lib/utils";

export function StatsStrip({
  totalUsers,
  online,
  totalListings,
  happyCount,
}: {
  totalUsers: number;
  online: number;
  totalListings: number;
  happyCount: number;
}) {
  const items = [
    { icon: Users, label: "Toplam Üye", value: totalUsers, accent: false },
    { icon: UserCheck, label: "Aktif Üye", value: online, accent: true },
    { icon: FileText, label: "Toplam İlan", value: totalListings, accent: false },
    {
      icon: HeartHandshake,
      label: "Mutlu Evlilik",
      value: happyCount,
      accent: false,
    },
  ];
  return (
    <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {items.map((it) => (
        <div
          key={it.label}
          className="flex items-center gap-3 rounded-[var(--radius-card)] border border-border bg-surface p-4"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-soft text-primary">
            <it.icon className="size-5" />
          </span>
          <span className="flex flex-col">
            <span className="text-xs text-muted-foreground">{it.label}</span>
            <span className="flex items-center gap-1.5 text-xl font-bold">
              {it.accent && (
                <span className="h-2 w-2 rounded-full bg-success" />
              )}
              {formatCount(it.value)}
            </span>
          </span>
        </div>
      ))}
    </section>
  );
}
