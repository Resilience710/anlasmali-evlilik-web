"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { reportSchema } from "@/lib/validations";
import { isUserBanned } from "@/lib/auth-guards";

export async function toggleFavoriteAction(listingId: string) {
  const session = await auth();
  if (!session?.user?.id) redirect("/giris");
  const userId = session.user.id;
  if (await isUserBanned(userId)) redirect("/hesap-askida");

  const existing = await prisma.favorite.findUnique({
    where: { userId_listingId: { userId, listingId } },
  });

  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } });
  } else {
    // Yalnızca yayında olan (silinmemiş, onaylı) ilanlar favorilenebilir
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: { authorId: true, title: true, status: true, deletedAt: true },
    });
    if (!listing || listing.deletedAt || listing.status !== "APPROVED") {
      revalidatePath("/hesabim/favorilerim");
      return;
    }
    await prisma.favorite.create({ data: { userId, listingId } });
    // İlan sahibine bildirim
    if (listing.authorId !== userId) {
      await prisma.notification.create({
        data: {
          userId: listing.authorId,
          type: "FAVORITE",
          title: "İlanınız favorilere eklendi",
          body: `"${listing.title}" ilanınız bir üyenin favorilerine eklendi.`,
          linkUrl: "/hesabim/ilanlarim",
        },
      });
    }
  }

  revalidatePath("/hesabim/favorilerim");
}

export type ReportState = { error?: string; success?: string };

export async function reportAction(
  _prev: ReportState,
  formData: FormData
): Promise<ReportState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Şikayet için giriş yapın." };
  if (await isUserBanned(session.user.id)) redirect("/hesap-askida");

  const parsed = reportSchema.safeParse({
    targetType: formData.get("targetType"),
    listingId: formData.get("listingId") || undefined,
    reportedUserId: formData.get("reportedUserId") || undefined,
    messageId: formData.get("messageId") || undefined,
    reason: formData.get("reason"),
    detail: formData.get("detail") || undefined,
  });
  if (!parsed.success) return { error: "Lütfen bir sebep seçin." };

  let listingId = parsed.data.listingId;
  let reportedUserId = parsed.data.reportedUserId;
  let messageId = parsed.data.messageId;

  // Hedefin gerçekten var olduğunu doğrula (geçersiz ID ile sahte şikayet engellenir)
  if (parsed.data.targetType === "LISTING") {
    const exists = await prisma.listing.findFirst({
      where: { id: listingId, deletedAt: null },
      select: { id: true },
    });
    if (!exists) return { error: "Şikayet edilen ilan bulunamadı." };
    messageId = undefined;
  } else if (parsed.data.targetType === "USER") {
    const exists = await prisma.user.findFirst({
      where: { id: reportedUserId, deletedAt: null },
      select: { id: true },
    });
    if (!exists) return { error: "Şikayet edilen kullanıcı bulunamadı." };
    messageId = undefined;
  } else if (parsed.data.targetType === "MESSAGE") {
    // Mesajı doğrula, şikayet edileni mesajın göndericisinden türet (güvenli)
    const msg = await prisma.message.findFirst({
      where: { id: messageId, deletedAt: null },
      select: { id: true, senderId: true, conversation: { select: { userAId: true, userBId: true } } },
    });
    if (!msg) return { error: "Şikayet edilen mesaj bulunamadı." };
    // Sadece konuşmanın tarafı şikayet edebilir
    const inConv =
      msg.conversation.userAId === session.user.id ||
      msg.conversation.userBId === session.user.id;
    if (!inConv) return { error: "Bu mesajı şikayet etme yetkiniz yok." };
    if (msg.senderId === session.user.id)
      return { error: "Kendi mesajınızı şikayet edemezsiniz." };
    reportedUserId = msg.senderId;
    messageId = msg.id;
    listingId = undefined;
  }

  await prisma.report.create({
    data: {
      reporterId: session.user.id,
      targetType: parsed.data.targetType,
      listingId,
      reportedUserId,
      messageId,
      reason: parsed.data.reason,
      detail: parsed.data.detail,
      status: "OPEN",
    },
  });

  return { success: "Şikayetiniz alındı, en kısa sürede incelenecektir." };
}

export async function markAllNotificationsReadAction() {
  const session = await auth();
  if (!session?.user?.id) return;
  await prisma.notification.updateMany({
    where: { userId: session.user.id, isRead: false },
    data: { isRead: true },
  });
  revalidatePath("/hesabim/bildirimler");
}
