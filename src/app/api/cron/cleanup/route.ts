import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Süresi dolmuş doğrulama tokenlarını ve rate-limit satırlarını temizler.
// Vercel Cron, CRON_SECRET ayarlıysa Authorization: Bearer <secret> gönderir.
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const authz = req.headers.get("authorization");
    const key = new URL(req.url).searchParams.get("key");
    if (authz !== `Bearer ${secret}` && key !== secret) {
      return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
    }
  }

  const now = new Date();
  const [vt, rl] = await Promise.all([
    prisma.verificationToken.deleteMany({ where: { expires: { lt: now } } }),
    prisma.rateLimit.deleteMany({ where: { expiresAt: { lt: now } } }),
  ]);
  return NextResponse.json({
    ok: true,
    verificationTokens: vt.count,
    rateLimits: rl.count,
  });
}
