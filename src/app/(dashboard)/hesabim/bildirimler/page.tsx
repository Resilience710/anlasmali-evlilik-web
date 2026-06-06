import type { Metadata } from "next";
import Link from "next/link";
import {
  MessageSquare,
  Heart,
  FileCheck,
  FileX,
  Flag,
  Info,
} from "lucide-react";
import { requireUser } from "@/lib/auth-guards";
import { getUserNotifications } from "@/lib/notifications";
import { MarkAllReadButton } from "@/components/dashboard/mark-all-read-button";
import { timeAgo, cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Bildirimlerim" };

const ICONS: Record<string, React.ElementType> = {
  MESSAGE: MessageSquare,
  FAVORITE: Heart,
  LISTING_APPROVED: FileCheck,
  LISTING_REJECTED: FileX,
  REPORT: Flag,
  SYSTEM: Info,
};

export default async function NotificationsPage() {
  const user = await requireUser();
  const notifications = await getUserNotifications(user.id);
  const hasUnread = notifications.some((n) => !n.isRead);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Bildirimlerim</h1>
        {hasUnread && <MarkAllReadButton />}
      </div>

      {notifications.length === 0 ? (
        <div className="rounded-[var(--radius-card)] border border-border bg-surface p-6 text-center text-muted-foreground sm:p-10">
          Bildiriminiz yok.
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {notifications.map((n) => {
            const Icon = ICONS[n.type] ?? Info;
            const content = (
              <div
                className={cn(
                  "flex items-start gap-3 rounded-[var(--radius-card)] border p-4 transition-colors",
                  n.isRead
                    ? "border-border bg-surface"
                    : "border-primary/30 bg-primary-soft/40"
                )}
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-elevated text-primary">
                  <Icon className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{n.title}</p>
                  {n.body && (
                    <p className="text-sm text-muted-foreground">{n.body}</p>
                  )}
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {timeAgo(n.createdAt)}
                  </p>
                </div>
                {!n.isRead && (
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                )}
              </div>
            );
            return n.linkUrl ? (
              <Link key={n.id} href={n.linkUrl}>
                {content}
              </Link>
            ) : (
              <div key={n.id}>{content}</div>
            );
          })}
        </div>
      )}
    </div>
  );
}
