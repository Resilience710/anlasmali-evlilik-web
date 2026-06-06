"use client";

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
  ChevronDown,
  ShieldCheck,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
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

export function ProfileDropdown({
  name,
  avatarUrl,
  isAdmin,
}: {
  name: string;
  avatarUrl?: string | null;
  isAdmin?: boolean;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex cursor-pointer items-center gap-2 rounded-full p-1 pr-2 transition-colors hover:bg-elevated focus:outline-none">
        <Avatar className="h-9 w-9">
          {avatarUrl && <AvatarImage src={avatarUrl} alt={name} />}
          <AvatarFallback>{initials(name)}</AvatarFallback>
        </Avatar>
        <span className="hidden flex-col items-center text-center leading-tight sm:flex">
          <span className="whitespace-nowrap text-sm font-medium">{name}</span>
          <span className="text-[0.7rem] text-muted-foreground">Profilim</span>
        </span>
        <ChevronDown className="size-4 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel>{name}</DropdownMenuLabel>
        <DropdownMenuItem asChild>
          <Link href="/hesabim">Hesabım</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {ACCOUNT_NAV.map((item) => {
          const Icon = ICONS[item.icon] ?? User;
          return (
            <DropdownMenuItem key={item.href} asChild>
              <Link href={item.href}>
                <Icon />
                {item.label}
              </Link>
            </DropdownMenuItem>
          );
        })}
        {isAdmin && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/admin" className="text-primary">
                <ShieldCheck />
                Yönetim Paneli
              </Link>
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuSeparator />
        <form action={signOutAction}>
          <button
            type="submit"
            className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-destructive outline-none transition-colors hover:bg-surface"
          >
            <LogOut className="size-4" />
            Çıkış Yap
          </button>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
