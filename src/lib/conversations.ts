import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

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

export async function getUnreadMessageTotal(userId: string): Promise<number> {
  // Tek sorgu (N+1 yok): her konuşmanın kendi lastRead eşiğine göre okunmamışlar.
  const rows = await prisma.$queryRaw<{ total: bigint }[]>`
    SELECT COUNT(*)::bigint AS total
    FROM "Message" m
    JOIN "Conversation" c ON m."conversationId" = c.id
    WHERE m."deletedAt" IS NULL
      AND m."senderId" <> ${userId}
      AND (c."userAId" = ${userId} OR c."userBId" = ${userId})
      AND m."createdAt" > COALESCE(
        CASE WHEN c."userAId" = ${userId} THEN c."lastReadA" ELSE c."lastReadB" END,
        '1970-01-01'::timestamp)
  `;
  return Number(rows[0]?.total ?? 0);
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

  // Okunmamış sayıları tek sorguda (N+1 yok)
  const unreadMap = new Map<string, number>();
  const convIds = convs.map((c) => c.id);
  if (convIds.length) {
    const rows = await prisma.$queryRaw<
      { conversationId: string; cnt: bigint }[]
    >`
      SELECT m."conversationId" AS "conversationId", COUNT(*)::bigint AS cnt
      FROM "Message" m
      JOIN "Conversation" c ON m."conversationId" = c.id
      WHERE m."deletedAt" IS NULL
        AND m."senderId" <> ${userId}
        AND c.id IN (${Prisma.join(convIds)})
        AND m."createdAt" > COALESCE(
          CASE WHEN c."userAId" = ${userId} THEN c."lastReadA" ELSE c."lastReadB" END,
          '1970-01-01'::timestamp)
      GROUP BY m."conversationId"
    `;
    for (const r of rows) unreadMap.set(r.conversationId, Number(r.cnt));
  }

  return convs.map((c) => {
    const other = c.userAId === userId ? c.userB : c.userA;
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
      unread: unreadMap.get(c.id) ?? 0,
    };
  });
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
  // Karşı tarafın okuma zamanı (okundu bilgisi için)
  const otherLastRead =
    conv.userAId === userId ? conv.lastReadB : conv.lastReadA;
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
    otherLastRead,
    messages,
  };
}
