import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }

  const conv = await prisma.conversation.findUnique({
    where: { id },
    select: { userAId: true, userBId: true, lastReadA: true, lastReadB: true },
  });
  if (!conv || (conv.userAId !== session.user.id && conv.userBId !== session.user.id)) {
    return NextResponse.json({ error: "Bulunamadı." }, { status: 404 });
  }

  // Karşı tarafın okuma zamanı (okundu bilgisi için)
  const otherLastRead =
    conv.userAId === session.user.id ? conv.lastReadB : conv.lastReadA;

  const messages = await prisma.message.findMany({
    where: { conversationId: id, deletedAt: null },
    orderBy: { createdAt: "asc" },
    take: 200,
    select: { id: true, senderId: true, body: true, createdAt: true },
  });

  return NextResponse.json({
    messages,
    otherLastRead: otherLastRead ? otherLastRead.toISOString() : null,
  });
}
