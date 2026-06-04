"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { reportSchema } from "@/lib/validations";

export async function toggleFavoriteAction(listingId: string) {
  const session = await auth();
  if (!session?.user?.id) redirect("/giris");
  const userId = session.user.id;

  const existing = await prisma.favorite.findUnique({
    where: { userId_listingId: { userId, listingId } },
  });

  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } });
  } else {
    await prisma.favorite.create({ data: { userId, listingId } });
    // İlan sahibine bildirim
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: { authorId: true, title: true },
    });
    if (listing && listing.authorId !== userId) {
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

  const parsed = reportSchema.safeParse({
    targetType: formData.get("targetType"),
    listingId: formData.get("listingId") || undefined,
    reportedUserId: formData.get("reportedUserId") || undefined,
    reason: formData.get("reason"),
    detail: formData.get("detail") || undefined,
  });
  if (!parsed.success) return { error: "Lütfen bir sebep seçin." };

  await prisma.report.create({
    data: {
      reporterId: session.user.id,
      targetType: parsed.data.targetType,
      listingId: parsed.data.listingId,
      reportedUserId: parsed.data.reportedUserId,
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
