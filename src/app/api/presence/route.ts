import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getOnlineCount } from "@/lib/stats";

// Online göstergesi için "son görülme" zamanını günceller.
export async function POST() {
  const session = await auth();
  if (session?.user?.id) {
    await prisma.user
      .update({
        where: { id: session.user.id },
        data: { lastSeenAt: new Date() },
      })
      .catch(() => {});
  }
  const online = await getOnlineCount();
  return NextResponse.json({ online });
}

export async function GET() {
  const online = await getOnlineCount();
  return NextResponse.json({ online });
}
