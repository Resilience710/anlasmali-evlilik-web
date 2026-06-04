import { prisma } from "@/lib/prisma";

/** İki kullanıcı için kanonik (sıralı) çift döndürür. */
export function canonicalPair(a: string, b: string): [string, string] {
  return a < b ? [a, b] : [b, a];
}

export async function getOrCreateConversation(meId: string, otherId: string) {
  if (meId === otherId) throw new Error("Kendinize mesaj gönderemezsiniz.");
  const [userAId, userBId] = canonicalPair(meId, otherId);
  const existing = await prisma.conversation.findUnique({
    where: { userAId_userBId: { userAId, userBId } },
  });
  if (existing) return existing;
  return prisma.conversation.create({ data: { userAId, userBId } });
}

function lastReadFor(
  conv: { userAId: string; lastReadA: Date | null; lastReadB: Date | null },
  userId: string
) {
  return conv.userAId === userId ? conv.lastReadA : conv.lastReadB;
}

export async function getUnreadMessageTotal(userId: string): Promise<number> {
  const convs = await prisma.conversation.findMany({
    where: { OR: [{ userAId: userId }, { userBId: userId }] },
    select: { id: true, userAId: true, lastReadA: true, lastReadB: true },
  });
  if (convs.length === 0) return 0;
  const counts = await Promise.all(
    convs.map((c) => {
      const lastRead = lastReadFor(c, userId);
      return prisma.message.count({
        where: {
          conversationId: c.id,
          senderId: { not: userId },
          deletedAt: null,
          ...(lastRead ? { createdAt: { gt: lastRead } } : {}),
        },
      });
    })
  );
  return counts.reduce((a, b) => a + b, 0);
}

export async function getUserConversations(userId: string) {
  const convs = await prisma.conversation.findMany({
    where: { OR: [{ userAId: userId }, { userBId: userId }] },
    orderBy: { lastMessageAt: "desc" },
    include: {
      userA: {
        select: {
          id: true,
          profile: { select: { displayName: true, avatarUrl: true } },
        },
      },
      userB: {
        select: {
          id: true,
          profile: { select: { displayName: true, avatarUrl: true } },
        },
      },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  const result = await Promise.all(
    convs.map(async (c) => {
      const other = c.userAId === userId ? c.userB : c.userA;
      const lastRead = lastReadFor(c, userId);
      const unread = await prisma.message.count({
        where: {
          conversationId: c.id,
          senderId: { not: userId },
          deletedAt: null,
          ...(lastRead ? { createdAt: { gt: lastRead } } : {}),
        },
      });
      return {
        id: c.id,
        lastMessageAt: c.lastMessageAt,
        other: {
          id: other.id,
          displayName: other.profile?.displayName ?? "Üye",
          avatarUrl: other.profile?.avatarUrl ?? null,
        },
        lastMessage: c.messages[0]
          ? { body: c.messages[0].body, senderId: c.messages[0].senderId }
          : null,
        unread,
      };
    })
  );
  return result;
}

export async function getConversationForUser(
  conversationId: string,
  userId: string
) {
  const conv = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      userA: {
        select: {
          id: true,
          profile: { select: { displayName: true, avatarUrl: true } },
        },
      },
      userB: {
        select: {
          id: true,
          profile: { select: { displayName: true, avatarUrl: true } },
        },
      },
    },
  });
  if (!conv || (conv.userAId !== userId && conv.userBId !== userId)) {
    return null;
  }
  const other = conv.userAId === userId ? conv.userB : conv.userA;
  const messages = await prisma.message.findMany({
    where: { conversationId, deletedAt: null },
    orderBy: { createdAt: "asc" },
    take: 200,
  });
  return {
    id: conv.id,
    other: {
      id: other.id,
      displayName: other.profile?.displayName ?? "Üye",
      avatarUrl: other.profile?.avatarUrl ?? null,
    },
    messages,
  };
}
