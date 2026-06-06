import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireUser } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { getConversationForUser } from "@/lib/conversations";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { MessageThread } from "@/components/messaging/message-thread";
import { initials } from "@/lib/utils";

export const metadata: Metadata = { title: "Mesaj" };

export default async function ThreadPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const user = await requireUser();
  const { conversationId } = await params;

  const data = await getConversationForUser(conversationId, user.id);
  if (!data) notFound();

  // Okundu olarak işaretle
  const conv = await prisma.conversation.findUnique({
    where: { id: conversationId },
    select: { userAId: true },
  });
  if (conv) {
    await prisma.conversation
      .update({
        where: { id: conversationId },
        data:
          conv.userAId === user.id
            ? { lastReadA: new Date() }
            : { lastReadB: new Date() },
      })
      .catch(() => {});
  }

  const initialMessages = data.messages.map((m) => ({
    id: m.id,
    senderId: m.senderId,
    body: m.body,
    createdAt: m.createdAt.toISOString(),
  }));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Link
          href="/hesabim/mesajlar"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border hover:bg-elevated lg:hidden"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <Link
          href={`/uyeler/${data.other.id}`}
          className="flex items-center gap-3"
        >
          <Avatar className="h-10 w-10">
            {data.other.avatarUrl && (
              <AvatarImage src={data.other.avatarUrl} alt={data.other.displayName} />
            )}
            <AvatarFallback>{initials(data.other.displayName)}</AvatarFallback>
          </Avatar>
          <span className="font-semibold">{data.other.displayName}</span>
        </Link>
      </div>

      <MessageThread
        conversationId={conversationId}
        meId={user.id}
        initialMessages={initialMessages}
        initialOtherLastRead={
          data.otherLastRead ? data.otherLastRead.toISOString() : null
        }
      />
    </div>
  );
}
