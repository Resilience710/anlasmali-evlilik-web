import type { Metadata } from "next";
import { getAdminStats, getDailyStats, getFunnel } from "@/lib/stats";
import { getCategorySidebar, getCitySidebar } from "@/lib/listings";
import { prisma } from "@/lib/prisma";
import { formatCount } from "@/lib/utils";

export const metadata: Metadata = { title: "İstatistikler — Yönetim" };

function BarChart({
  data,
  color,
  title,
}: {
  data: { label: string; value: number }[];
  color: string;
  title: string;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <div className="rounded-[var(--radius-card)] border border-border bg-surface p-5">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="font-semibold">{title}</h2>
        <span className="text-sm text-muted-foreground">
          son {data.length} gün · {formatCount(total)}
        </span>
      </div>
      <div className="flex h-32 items-end gap-1">
        {data.map((d, i) => (
          <div
            key={i}
            className="group relative flex flex-1 flex-col items-center justify-end"
            title={`${d.label}: ${d.value}`}
          >
            <div
              className="w-full rounded-t transition-all"
              style={{
                height: `${(d.value / max) * 100}%`,
                minHeight: d.value > 0 ? "3px" : "0",
                background: color,
              }}
            />
          </div>
        ))}
      </div>
      <div className="mt-1.5 flex justify-between text-[0.6rem] text-muted-foreground">
        <span>{data[0]?.label}</span>
        <span>{data[data.length - 1]?.label}</span>
      </div>
    </div>
  );
}

export default async function AdminStatsPage() {
  const [stats, funnel, daily, catSidebar, citySidebar, maleCount, femaleCount] =
    await Promise.all([
      getAdminStats(),
      getFunnel(),
      getDailyStats(14),
      getCategorySidebar(),
      getCitySidebar(20),
      prisma.profile.count({ where: { gender: "MALE" } }),
      prisma.profile.count({ where: { gender: "FEMALE" } }),
    ]);

  const cards = [
    { label: "Toplam Üye", value: stats.totalUsers },
    { label: "Aktif (Online)", value: stats.online },
    { label: "Yasaklı Üye", value: stats.bannedUsers },
    { label: "Toplam İlan", value: stats.totalListings },
    { label: "Toplam Mesaj", value: stats.totalMessages },
    { label: "Açık Şikayet", value: stats.openReports },
    { label: "Erkek Üye", value: maleCount },
    { label: "Kadın Üye", value: femaleCount },
  ];

  const funnelSteps = [
    { label: "Kayıt oldu", value: funnel.registered },
    { label: "Profilini tamamladı", value: funnel.profileComplete },
    { label: "İlan verdi", value: funnel.withListing },
    { label: "Mesaj attı", value: funnel.messaged },
  ];
  const funnelMax = Math.max(1, funnel.registered);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">İstatistikler</h1>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {cards.map((c) => (
          <div
            key={c.label}
            className="rounded-[var(--radius-card)] border border-border bg-surface p-4"
          >
            <p className="text-xs text-muted-foreground">{c.label}</p>
            <p className="mt-1 text-2xl font-bold">{formatCount(c.value)}</p>
          </div>
        ))}
      </div>

      {/* Zaman grafikleri (#7) */}
      <div className="grid gap-5 lg:grid-cols-3">
        <BarChart
          title="Yeni Üyeler"
          color="var(--color-primary)"
          data={daily.map((d) => ({ label: d.label, value: d.users }))}
        />
        <BarChart
          title="Yeni İlanlar"
          color="var(--color-accent)"
          data={daily.map((d) => ({ label: d.label, value: d.listings }))}
        />
        <BarChart
          title="Mesajlar"
          color="var(--color-success)"
          data={daily.map((d) => ({ label: d.label, value: d.messages }))}
        />
      </div>

      {/* Dönüşüm hunisi (#8) */}
      <div className="rounded-[var(--radius-card)] border border-border bg-surface p-5">
        <h2 className="mb-4 font-semibold">Dönüşüm Hunisi</h2>
        <div className="flex flex-col gap-3">
          {funnelSteps.map((s, i) => {
            const pct = Math.round((s.value / funnelMax) * 100);
            const ofPrev =
              i === 0 || funnelSteps[i - 1].value === 0
                ? null
                : Math.round((s.value / funnelSteps[i - 1].value) * 100);
            return (
              <div key={s.label}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span>{s.label}</span>
                  <span className="text-muted-foreground">
                    {formatCount(s.value)}
                    {ofPrev !== null && (
                      <span className="ml-2 text-xs">(%{ofPrev})</span>
                    )}
                  </span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-surface-2">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-[var(--radius-card)] border border-border bg-surface p-5">
          <h2 className="mb-3 font-semibold">Kategoriye Göre İlanlar</h2>
          <ul className="flex flex-col gap-2 text-sm">
            {catSidebar.categories.map((c) => (
              <li key={c.slug} className="flex justify-between">
                <span>{c.name}</span>
                <span className="font-medium">{formatCount(c.count)}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-[var(--radius-card)] border border-border bg-surface p-5">
          <h2 className="mb-3 font-semibold">Şehre Göre İlanlar</h2>
          <ul className="flex flex-col gap-2 text-sm">
            {citySidebar.map((c) => (
              <li key={c.slug} className="flex justify-between">
                <span>{c.name}</span>
                <span className="font-medium">{formatCount(c.count)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
