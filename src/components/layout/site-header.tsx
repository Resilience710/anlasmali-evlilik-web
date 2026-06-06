import Link from "next/link";
import { Bell, MessageSquare } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getSiteSettings } from "@/lib/site";
import { getOnlineCount } from "@/lib/stats";
import { getUnreadMessageTotal } from "@/lib/conversations";
import { getUnreadNotificationCount } from "@/lib/notifications";
import { formatCount } from "@/lib/utils";
import { Logo } from "./logo";
import { MainNav } from "./main-nav";
import { MobileNav } from "./mobile-nav";
import { ProfileDropdown } from "./profile-dropdown";
import { Button } from "@/components/ui/button";

function BellLink({
  href,
  count,
  label,
  children,
}: {
  href: string;
  count: number;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-elevated hover:text-foreground"
    >
      {children}
      {count > 0 && (
        <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[0.65rem] font-semibold text-primary-foreground">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}

export async function SiteHeader() {
  const [settings, session, online] = await Promise.all([
    getSiteSettings(),
    auth(),
    getOnlineCount(),
  ]);

  const userId = session?.user?.id;
  let profile: { displayName: string; avatarUrl: string | null } | null = null;
  let unreadMessages = 0;
  let unreadNotifications = 0;

  if (userId) {
    const [p, m, n] = await Promise.all([
      prisma.profile.findUnique({
        where: { userId },
        select: { displayName: true, avatarUrl: true },
      }),
      getUnreadMessageTotal(userId),
      getUnreadNotificationCount(userId),
    ]);
    profile = p ?? { displayName: "Üye", avatarUrl: null };
    unreadMessages = m;
    unreadNotifications = n;
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl shadow-card supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6">
        <Logo
          siteName={settings.siteName}
          tagline={settings.tagline}
          logoUrl={settings.logoUrl}
        />

        <div className="flex-1" />

        <MainNav />

        <div className="flex-1" />

        {/* Online göstergesi */}
        <div className="hidden items-center gap-2 rounded-lg border border-border bg-surface px-3 py-1.5 xl:flex">
          <span className="text-center leading-tight">
            <span className="block text-[0.65rem] text-muted-foreground">
              Şu anda aktif
            </span>
            <span className="block text-xs font-semibold text-success">
              {formatCount(online)} kişi online
            </span>
          </span>
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-success" />
          </span>
        </div>

        {userId && profile ? (
          <div className="flex items-center gap-2">
            <BellLink
              href="/hesabim/mesajlar"
              count={unreadMessages}
              label="Mesajlar"
            >
              <MessageSquare className="size-5" />
            </BellLink>
            <BellLink
              href="/hesabim/bildirimler"
              count={unreadNotifications}
              label="Bildirimler"
            >
              <Bell className="size-5" />
            </BellLink>
            <ProfileDropdown
              name={profile.displayName}
              avatarUrl={profile.avatarUrl}
              isAdmin={session?.user?.role === "ADMIN"}
            />
            <MobileNav isLoggedIn />
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="hidden sm:flex">
              <Link href="/giris">Giriş Yap</Link>
            </Button>
            <Button asChild size="sm" className="hidden sm:flex">
              <Link href="/kayit">Üye Ol</Link>
            </Button>
            <MobileNav isLoggedIn={false} />
          </div>
        )}
      </div>
    </header>
  );
}
