import Link from "next/link";
import {
  User,
  List,
  Heart,
  MessageSquare,
  Bell,
  Settings,
  KeyRound,
  LogOut,
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ACCOUNT_NAV } from "@/lib/constants";
import { initials } from "@/lib/utils";
import { signOutAction } from "@/app/_actions/auth";

const ICONS: Record<string, React.ElementType> = {
  user: User,
  list: List,
  heart: Heart,
  message: MessageSquare,
  bell: Bell,
  settings: Settings,
  key: KeyRound,
};

export function AccountPanel({
  user,
  unreadMessages = 0,
  unreadNotifications = 0,
}: {
  user: { id: string; name: string; avatarUrl?: string | null } | null;
  unreadMessages?: number;
  unreadNotifications?: number;
}) {
  if (!user) {
    return (
      <div className="rounded-[var(--radius-card)] border border-border bg-surface p-5 text-center">
        <h2 className="text-base font-semibold">Hesabım</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          İlan vermek ve mesajlaşmak için üye olun.
        </p>
        <div className="mt-4 flex flex-col gap-2">
          <Link
            href="/kayit"
            className="rounded-xl bg-primary py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
          >
            Üye Ol
          </Link>
          <Link
            href="/giris"
            className="rounded-xl border border-border py-2.5 text-sm font-medium transition-colors hover:bg-elevated"
          >
            Giriş Yap
          </Link>
        </div>
      </div>
    );
  }

  const badges: Record<string, number> = {
    "/hesabim/mesajlar": unreadMessages,
    "/hesabim/bildirimler": unreadNotifications,
  };

  return (
    <div className="rounded-[var(--radius-card)] border border-border bg-surface p-4">
      <h2 className="mb-3 px-1 text-base font-semibold">Hesabım</h2>
      <div className="flex items-center gap-3 rounded-xl bg-surface-2 p-3">
        <Avatar className="h-11 w-11">
          {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.name} />}
          <AvatarFallback>{initials(user.name)}</AvatarFallback>
        </Avatar>
        <span className="flex flex-col">
          <span className="font-medium">{user.name}</span>
          <Link
            href="/hesabim/profil"
            className="text-xs text-primary hover:underline"
          >
            Profilini Görüntüle
          </Link>
        </span>
      </div>

      <nav className="mt-3 flex flex-col gap-0.5">
        {ACCOUNT_NAV.map((item) => {
          const Icon = ICONS[item.icon] ?? User;
          const badge = badges[item.href] ?? 0;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-elevated"
            >
              <Icon className="size-4 text-muted-foreground" />
              <span className="flex-1">{item.label}</span>
              {badge > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[0.65rem] font-semibold text-primary-foreground">
                  {badge > 99 ? "99+" : badge}
                </span>
              )}
            </Link>
          );
        })}
        <form action={signOutAction}>
          <button
            type="submit"
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-destructive transition-colors hover:bg-elevated cursor-pointer"
          >
            <LogOut className="size-4" />
            Çıkış Yap
          </button>
        </form>
      </nav>
    </div>
  );
}
