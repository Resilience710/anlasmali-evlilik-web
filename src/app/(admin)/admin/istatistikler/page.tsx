import type { Metadata } from "next";
import { getAdminStats } from "@/lib/stats";
import { getCategorySidebar, getCitySidebar } from "@/lib/listings";
import { prisma } from "@/lib/prisma";
import { formatCount } from "@/lib/utils";

export const metadata: Metadata = { title: "İstatistikler — Yönetim" };

export default async function AdminStatsPage() {
  const [stats, catSidebar, citySidebar, maleCount, femaleCount] =
    await Promise.all([
      getAdminStats(),
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
    { label: "Onay Bekleyen", value: stats.pendingListings },
    { label: "Reddedilen", value: stats.rejectedListings },
    { label: "Toplam Mesaj", value: stats.totalMessages },
    { label: "Açık Şikayet", value: stats.openReports },
    { label: "Erkek Üye", value: maleCount },
    { label: "Kadın Üye", value: femaleCount },
  ];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">İstatistikler</h1>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
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
