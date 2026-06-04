import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CatalogDeleteButton } from "@/components/admin/simple-action-buttons";
import { initials, timeAgo } from "@/lib/utils";

export const metadata: Metadata = { title: "Mesajlar — Yönetim" };

export default async function AdminMessagesPage() {
  const messages = await prisma.message.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      sender: { select: { profile: { select: { displayName: true } } } },
    },
  });

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-2xl font-bold">Mesajlar</h1>
      <p className="text-sm text-muted-foreground">
        Son mesajlar. Uygunsuz içerikleri silebilirsiniz.
      </p>

      {messages.length === 0 ? (
        <div className="rounded-[var(--radius-card)] border border-border bg-surface p-10 text-center text-muted-foreground">
          Mesaj yok.
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {messages.map((m) => (
            <div
              key={m.id}
              className="flex items-start gap-3 rounded-[var(--radius-card)] border border-border bg-surface p-4"
            >
              <Avatar className="h-9 w-9">
                <AvatarFallback>
                  {initials(m.sender.profile?.displayName ?? "?")}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    {m.sender.profile?.displayName ?? "—"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {timeAgo(m.createdAt)}
                  </span>
                </div>
                <p className="mt-0.5 break-words text-sm text-foreground/90">
                  {m.body}
                </p>
              </div>
              <CatalogDeleteButton kind="message" id={m.id} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
