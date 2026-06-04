import type { Metadata } from "next";
import Link from "next/link";
import { List, Heart, MessageSquare, Bell, PlusCircle, Clock } from "lucide-react";
import { requireUser } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { getUnreadMessageTotal } from "@/lib/conversations";

export const metadata: Metadata = { title: "Hesabım" };

export default async function DashboardHome() {
  const user = await requireUser();
  const uid = user.id;

  const [profile, listingTotal, pending, favorites, unreadMsg, unreadNotif] =
    await Promise.all([
      prisma.profile.findUnique({
        where: { userId: uid },
        select: { displayName: true },
      }),
      prisma.listing.count({ where: { authorId: uid, deletedAt: null } }),
      prisma.listing.count({
        where: { authorId: uid, status: "PENDING", deletedAt: null },
      }),
      prisma.favorite.count({ where: { userId: uid } }),
      getUnreadMessageTotal(uid),
      prisma.notification.count({ where: { userId: uid, isRead: false } }),
    ]);

  const cards = [
    { icon: List, label: "İlanlarım", value: listingTotal, href: "/hesabim/ilanlarim" },
    { icon: Heart, label: "Favorilerim", value: favorites, href: "/hesabim/favorilerim" },
    { icon: MessageSquare, label: "Okunmamış Mesaj", value: unreadMsg, href: "/hesabim/mesajlar" },
    { icon: Bell, label: "Bildirim", value: unreadNotif, href: "/hesabim/bildirimler" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-[var(--radius-card)] border border-border bg-gradient-to-br from-surface to-surface-2 p-6">
        <h1 className="text-2xl font-bold">
          Hoş geldiniz, {profile?.displayName ?? "Üye"} 👋
        </h1>
        <p className="mt-1 text-muted-foreground">
          Hesabınızı buradan yönetebilirsiniz.
        </p>
        <Link
          href="/hesabim/ilan-olustur"
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
        >
          <PlusCircle className="size-4" />
          Yeni İlan Oluştur
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="flex items-center gap-3 rounded-[var(--radius-card)] border border-border bg-surface p-4 transition-colors hover:border-primary/40"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-soft text-primary">
              <c.icon className="size-5" />
            </span>
            <span className="flex flex-col">
              <span className="text-xs text-muted-foreground">{c.label}</span>
              <span className="text-xl font-bold">{c.value}</span>
            </span>
          </Link>
        ))}
      </div>

      {pending > 0 && (
        <div className="flex items-center gap-2 rounded-[var(--radius-card)] border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning">
          <Clock className="size-4" />
          {pending} ilanınız yönetici onayı bekliyor.
        </div>
      )}
    </div>
  );
}
