"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  User,
  List,
  Heart,
  MessageSquare,
  Bell,
  Settings,
  KeyRound,
  ShieldCheck,
  PlusCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ICONS: Record<string, React.ElementType> = {
  dashboard: LayoutDashboard,
  plus: PlusCircle,
  user: User,
  list: List,
  heart: Heart,
  message: MessageSquare,
  bell: Bell,
  settings: Settings,
  key: KeyRound,
  shield: ShieldCheck,
};

const ITEMS = [
  { href: "/hesabim", label: "Genel Bakış", icon: "dashboard", exact: true },
  { href: "/hesabim/ilan-olustur", label: "İlan Oluştur", icon: "plus" },
  { href: "/hesabim/profil", label: "Profil Bilgilerim", icon: "user" },
  { href: "/hesabim/ilanlarim", label: "İlanlarım", icon: "list" },
  { href: "/hesabim/favorilerim", label: "Favorilerim", icon: "heart" },
  { href: "/hesabim/mesajlar", label: "Mesajlarım", icon: "message" },
  { href: "/hesabim/bildirimler", label: "Bildirimlerim", icon: "bell" },
  { href: "/hesabim/ayarlar", label: "Hesap Ayarlarım", icon: "settings" },
  { href: "/hesabim/sifre-degistir", label: "Şifre Değiştir", icon: "key" },
];

export function DashboardSidebar({ isAdmin }: { isAdmin?: boolean }) {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");

  return (
    <nav className="flex gap-1 overflow-x-auto rounded-[var(--radius-card)] border border-border bg-surface p-2 lg:flex-col lg:overflow-visible">
      {ITEMS.map((item) => {
        const Icon = ICONS[item.icon] ?? User;
        const active = isActive(item.href, item.exact);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "text-foreground/90 hover:bg-elevated"
            )}
          >
            <Icon className="size-4" />
            <span className="whitespace-nowrap">{item.label}</span>
          </Link>
        );
      })}
      {isAdmin && (
        <Link
          href="/admin"
          className="flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-primary transition-colors hover:bg-elevated"
        >
          <ShieldCheck className="size-4" />
          <span className="whitespace-nowrap">Yönetim Paneli</span>
        </Link>
      )}
    </nav>
  );
}
