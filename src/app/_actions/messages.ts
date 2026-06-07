"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { messageSchema } from "@/lib/validations";
import { getOrCreateConversation, canonicalPair } from "@/lib/conversations";
import { getMissingProfileFields } from "@/lib/profile-completeness";
import { checkRateLimit } from "@/lib/rate-limit";
import { isUserBanned } from "@/lib/auth-guards";
import { findBannedWord, BANNED_CONTENT_MESSAGE } from "@/lib/moderation";

export type MessageActionState = { error?: string };

const MSG_TOO_FAST =
  "Çok hızlı mesaj gönderiyorsunuz. Lütfen biraz bekleyip tekrar deneyin.";

/**
 * Mesaj göndermeden önceki ortak ön koşullar:
 * giriş + yasak + profil tamamlama + rate limit. (Her iki gönderme akışında ortak.)
 * Hata yoksa { me } döndürür; aksi halde redirect eder ya da { error } verir.
 */
async function prepareSend(): Promise<{ me: string } | { error: string }> {
  const session = await auth();
  if (!session?.user?.id) redirect("/giris");
  const me = session.user.id;

  if (await isUserBanned(me)) redirect("/hesap-askida");

  const profile = await prisma.profile.findUnique({ where: { userId: me } });
  if (getMissingProfileFields(profile).length > 0) {
    redirect("/hesabim/profil?eksik=1");
  }

  if (!(await checkRateLimit(`msg:${me}`, 60, 60)).ok) {
    return { error: MSG_TOO_FAST };
  }
  return { me };
}

/** Mesajı + konuşma güncellemesini + bildirimi tek transaction'da kaydeder. */
async function persistMessage(
  conversationId: string,
  senderId: string,
  recipientId: string,
  body: string
) {
  await prisma.$transaction([
    prisma.message.create({
      data: { conversationId, senderId, body },
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
}

export async function sendMessageAction(
  _prev: MessageActionState,
  formData: FormData
): Promise<MessageActionState> {
  const prep = await prepareSend();
  if ("error" in prep) return { error: prep.error };
  const me = prep.me;

  const parsed = messageSchema.safeParse({
    recipientId: formData.get("recipientId"),
    body: formData.get("body"),
  });
  if (!parsed.success) {
    return { error: "Mesaj gönderilemedi. Geçerli bir mesaj yazın." };
  }

  const { recipientId, body } = parsed.data;

  if (recipientId === me) {
    return { error: "Kendinize mesaj gönderemezsiniz." };
  }
  if (await findBannedWord(body)) {
    return { error: BANNED_CONTENT_MESSAGE };
  }

  const recipient = await prisma.user.findUnique({
    where: { id: recipientId },
    select: { id: true, isBanned: true, deletedAt: true },
  });
  if (!recipient || recipient.isBanned || recipient.deletedAt) {
    return { error: "Alıcı bulunamadı." };
  }

  const conv = await getOrCreateConversation(me, recipientId);
  await persistMessage(conv.id, me, recipientId, body);

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
  const prep = await prepareSend();
  if ("error" in prep) return { error: prep.error };
  const me = prep.me;

  const body = String(formData.get("body") ?? "").trim();
  if (!body) return { error: "Mesaj boş olamaz." };
  if (body.length > 2000) return { error: "Mesaj çok uzun." };
  if (await findBannedWord(body)) return { error: BANNED_CONTENT_MESSAGE };

  const conv = await prisma.conversation.findUnique({
    where: { id: conversationId },
    select: { id: true, userAId: true, userBId: true },
  });
  if (!conv || (conv.userAId !== me && conv.userBId !== me)) {
    return { error: "Yetkisiz işlem." };
  }
  const recipientId = conv.userAId === me ? conv.userBId : conv.userAId;

  await persistMessage(conversationId, me, recipientId, body);

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
