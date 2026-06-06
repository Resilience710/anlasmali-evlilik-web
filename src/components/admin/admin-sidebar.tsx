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
} from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/admin", label: "Genel Bakış", icon: LayoutDashboard, exact: true },
  { href: "/admin/uyeler", label: "Üyeler", icon: Users },
  { href: "/admin/ilanlar", label: "İlanlar", icon: FileText },
  { href: "/admin/kategoriler", label: "Kategoriler", icon: Tags },
  { href: "/admin/sehirler", label: "Şehirler", icon: MapPin },
  { href: "/admin/yas-secenekleri", label: "Yaş Seçenekleri", icon: CalendarRange },
  { href: "/admin/mesajlar", label: "Mesajlar", icon: MessageSquare },
  { href: "/admin/sikayetler", label: "Şikayetler", icon: Flag },
  { href: "/admin/istatistikler", label: "İstatistikler", icon: BarChart3 },
  { href: "/admin/loglar", label: "Denetim Kayıtları", icon: ScrollText },
  { href: "/admin/ayarlar", label: "Site Ayarları", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");

  return (
    <nav className="flex gap-1 overflow-x-auto rounded-[var(--radius-card)] border border-border bg-surface p-2 lg:flex-col lg:overflow-visible">
      {ITEMS.map((item) => {
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
