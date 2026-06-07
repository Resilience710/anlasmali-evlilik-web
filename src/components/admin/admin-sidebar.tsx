"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FileText,
  Tags,
  MapPin,
  CalendarRange,
  MessageSquare,
  Flag,
  BarChart3,
  Settings,
  ScrollText,
  Ban,
} from "lucide-react";
import { cn } from "@/lib/utils";

// adminOnly: yalnız ADMIN görür. Diğerleri MODERATOR'a da açık.
const ITEMS = [
  { href: "/admin", label: "Genel Bakış", icon: LayoutDashboard, exact: true },
  { href: "/admin/uyeler", label: "Üyeler", icon: Users },
  { href: "/admin/ilanlar", label: "İlanlar", icon: FileText },
  { href: "/admin/mesajlar", label: "Mesaj Şikayetleri", icon: MessageSquare },
  { href: "/admin/sikayetler", label: "Şikayetler", icon: Flag },
  { href: "/admin/istatistikler", label: "İstatistikler", icon: BarChart3 },
  { href: "/admin/kategoriler", label: "Kategoriler", icon: Tags, adminOnly: true },
  { href: "/admin/sehirler", label: "Şehirler", icon: MapPin, adminOnly: true },
  { href: "/admin/yas-secenekleri", label: "Yaş Seçenekleri", icon: CalendarRange, adminOnly: true },
  { href: "/admin/yasakli-kelimeler", label: "Yasaklı Kelimeler", icon: Ban, adminOnly: true },
  { href: "/admin/loglar", label: "Denetim Kayıtları", icon: ScrollText, adminOnly: true },
  { href: "/admin/ayarlar", label: "Site Ayarları", icon: Settings, adminOnly: true },
];

export function AdminSidebar({ role }: { role?: string }) {
  const pathname = usePathname();
  const isAdmin = role === "ADMIN";
  const items = ITEMS.filter((i) => isAdmin || !i.adminOnly);
  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");

  return (
    <nav className="flex gap-1 overflow-x-auto rounded-[var(--radius-card)] border border-border bg-surface p-2 lg:flex-col lg:overflow-visible">
      {items.map((item) => {
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
            <item.icon className="size-4" />
            <span className="whitespace-nowrap">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
