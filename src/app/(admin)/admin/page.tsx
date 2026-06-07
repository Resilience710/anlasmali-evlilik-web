import type { Metadata } from "next";
import Link from "next/link";
import {
  Users,
  FileText,
  Flag,
  MessageSquare,
  UserCheck,
} from "lucide-react";
import { getAdminStats } from "@/lib/stats";
import { prisma } from "@/lib/prisma";
import { formatCount, timeAgo } from "@/lib/utils";

export const metadata: Metadata = { title: "Yönetim Paneli" };

export default async function AdminDashboard() {
  const stats = await getAdminStats();
  const openReports = await prisma.report.findMany({
    where: { status: "OPEN" },
    orderBy: { createdAt: "desc" },
    take: 8,
  });

  const cards = [
    { icon: Users, label: "Toplam Üye", value: stats.totalUsers, href: "/admin/uyeler" },
    { icon: UserCheck, label: "Aktif (Online)", value: stats.online },
    { icon: FileText, label: "Toplam İlan", value: stats.totalListings, href: "/admin/ilanlar" },
    { icon: Flag, label: "Açık Şikayet", value: stats.openReports, href: "/admin/sikayetler", accent: true },
    { icon: MessageSquare, label: "Toplam Mesaj", value: stats.totalMessages, href: "/admin/mesajlar" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Genel Bakış</h1>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {cards.map((c) => {
          const inner = (
            <div
              className={`flex items-center gap-3 rounded-[var(--radius-card)] border bg-surface p-4 ${
                c.accent && c.value > 0
                  ? "border-primary/40"
                  : "border-border"
              }`}
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-soft text-primary">
                <c.icon className="size-5" />
              </span>
              <span className="flex flex-col">
                <span className="text-xs text-muted-foreground">{c.label}</span>
                <span className="text-xl font-bold">{formatCount(c.value)}</span>
              </span>
            </div>
          );
          return c.href ? (
            <Link key={c.label} href={c.href}>
              {inner}
            </Link>
          ) : (
            <div key={c.label}>{inner}</div>
          );
        })}
      </div>

      <div className="rounded-[var(--radius-card)] border border-border bg-surface p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold">Açık Şikayetler</h2>
          <Link href="/admin/sikayetler" className="text-sm text-primary hover:underline">
            Tümü
          </Link>
        </div>
        {openReports.length === 0 ? (
          <p className="text-sm text-muted-foreground">Açık şikayet yok.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {openReports.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-2 rounded-lg bg-surface-2 p-2.5 text-sm">
                <span className="min-w-0 truncate">{r.reason}</span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {timeAgo(r.createdAt)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
