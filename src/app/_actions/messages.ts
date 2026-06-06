"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { messageSchema } from "@/lib/validations";
import { getOrCreateConversation, canonicalPair } from "@/lib/conversations";
import { getMissingProfileFields } from "@/lib/profile-completeness";
import { checkRateLimit } from "@/lib/rate-limit";

export type MessageActionState = { error?: string };

const MSG_TOO_FAST =
  "Çok hızlı mesaj gönderiyorsunuz. Lütfen biraz bekleyip tekrar deneyin.";

async function requireCompleteProfile(userId: string) {
  const profile = await prisma.profile.findUnique({ where: { userId } });
  if (getMissingProfileFields(profile).length > 0) {
    redirect("/hesabim/profil?eksik=1");
  }
}

export async function sendMessageAction(
  _prev: MessageActionState,
  formData: FormData
): Promise<MessageActionState> {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/giris");
  }

  // Mesaj göndermeden önce profil eksiksiz olmalı
  await requireCompleteProfile(session.user.id);

  if (!(await checkRateLimit(`msg:${session.user.id}`, 60, 60)).ok) {
    return { error: MSG_TOO_FAST };
  }

  const parsed = messageSchema.safeParse({
    recipientId: formData.get("recipientId"),
    body: formData.get("body"),
  });
  if (!parsed.success) {
    return { error: "Mesaj gönderilemedi. Geçerli bir mesaj yazın." };
  }

  const me = session.user.id;
  const { recipientId, body } = parsed.data;

  if (recipientId === me) {
    return { error: "Kendinize mesaj gönderemezsiniz." };
  }

  const recipient = await prisma.user.findUnique({
    where: { id: recipientId },
    select: { id: true, isBanned: true, deletedAt: true },
  });
  if (!recipient || recipient.isBanned || recipient.deletedAt) {
    return { error: "Alıcı bulunamadı." };
  }

  const conv = await getOrCreateConversation(me, recipientId);

  await prisma.$transaction([
    prisma.message.create({
      data: { conversationId: conv.id, senderId: me, body },
    }),
    prisma.conversation.update({
      where: { id: conv.id },
      data: { lastMessageAt: new Date() },
    }),
    prisma.notification.create({
      data: {
        userId: recipientId,
        type: "MESSAGE",
        title: "Yeni mesajınız var",
        body: body.length > 60 ? body.slice(0, 60) + "…" : body,
        linkUrl: `/hesabim/mesajlar/${conv.id}`,
      },
    }),
  ]);

  revalidatePath(`/hesabim/mesajlar/${conv.id}`);
  revalidatePath("/hesabim/mesajlar");
  redirect(`/hesabim/mesajlar/${conv.id}`);
}

/** Konuşma içinden mesaj gönderir (thread sayfasında kalır). */
export async function replyAction(
  conversationId: string,
  _prev: MessageActionState,
  formData: FormData
): Promise<MessageActionState> {
  const session = await auth();
  if (!session?.user?.id) redirect("/giris");
  const me = session.user.id;

  // Mesaj göndermeden önce profil eksiksiz olmalı
  await requireCompleteProfile(me);

  if (!(await checkRateLimit(`msg:${me}`, 60, 60)).ok) {
    return { error: MSG_TOO_FAST };
  }

  const body = String(formData.get("body") ?? "").trim();
  if (!body) return { error: "Mesaj boş olamaz." };
  if (body.length > 2000) return { error: "Mesaj çok uzun." };

  const conv = await prisma.conversation.findUnique({
    where: { id: conversationId },
    select: { id: true, userAId: true, userBId: true },
  });
  if (!conv || (conv.userAId !== me && conv.userBId !== me)) {
    return { error: "Yetkisiz işlem." };
  }
  const recipientId = conv.userAId === me ? conv.userBId : conv.userAId;

  await prisma.$transaction([
    prisma.message.create({
      data: { conversationId, senderId: me, body },
    }),
    prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() },
    }),
    prisma.notification.create({
      data: {
        userId: recipientId,
        type: "MESSAGE",
        title: "Yeni mesajınız var",
        body: body.length > 60 ? body.slice(0, 60) + "…" : body,
        linkUrl: `/hesabim/mesajlar/${conversationId}`,
      },
    }),
  ]);

  revalidatePath(`/hesabim/mesajlar/${conversationId}`);
  return {};
}

export async function markConversationReadAction(conversationId: string) {
  const session = await auth();
  if (!session?.user?.id) return;
  const me = session.user.id;
  const conv = await prisma.conversation.findUnique({
    where: { id: conversationId },
    select: { userAId: true, userBId: true },
  });
  if (!conv || (conv.userAId !== me && conv.userBId !== me)) return;

  const [userAId] = canonicalPair(conv.userAId, conv.userBId);
  void userAId;
  await prisma.conversation.update({
    where: { id: conversationId },
    data:
      conv.userAId === me
        ? { lastReadA: new Date() }
        : { lastReadB: new Date() },
  });
  revalidatePath("/hesabim/mesajlar");
}
