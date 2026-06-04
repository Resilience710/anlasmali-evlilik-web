import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/auth-guards";
import { getUserConversations } from "@/lib/conversations";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { initials, timeAgo } from "@/lib/utils";

export const metadata: Metadata = { title: "Mesajlarım" };

export default async function MessagesPage() {
  const user = await requireUser();
  const conversations = await getUserConversations(user.id);

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-2xl font-bold">Mesajlarım</h1>

      {conversations.length === 0 ? (
        <div className="rounded-[var(--radius-card)] border border-border bg-surface p-10 text-center text-muted-foreground">
          Henüz mesajınız yok. İlanlara göz atıp iletişime geçin.
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {conversations.map((c) => (
            <Link
              key={c.id}
              href={`/hesabim/mesajlar/${c.id}`}
              className="flex items-center gap-3 rounded-[var(--radius-card)] border border-border bg-surface p-3 transition-colors hover:border-primary/40"
            >
              <Avatar className="h-12 w-12">
                {c.other.avatarUrl && (
                  <AvatarImage src={c.other.avatarUrl} alt={c.other.displayName} />
                )}
                <AvatarFallback>{initials(c.other.displayName)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate font-medium">{c.other.displayName}</p>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {timeAgo(c.lastMessageAt)}
                  </span>
                </div>
                <p className="truncate text-sm text-muted-foreground">
                  {c.lastMessage
                    ? (c.lastMessage.senderId === user.id ? "Siz: " : "") +
                      c.lastMessage.body
                    : "Yeni konuşma"}
                </p>
              </div>
              {c.unread > 0 && (
                <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-semibold text-primary-foreground">
                  {c.unread}
                </span>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
