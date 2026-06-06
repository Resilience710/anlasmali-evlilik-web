import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

/** İstemci IP'sini başlıklardan çıkarır (Vercel/proxy uyumlu). */
export async function getClientIp(): Promise<string> {
  const h = await headers();
  const fwd = h.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return h.get("x-real-ip") ?? "unknown";
}

/**
 * DB tabanlı basit rate limit (sunucusuz uyumlu).
 * Pencere dolmuşsa sıfırlar, değilse sayacı artırır.
 * DB hatasında fail-open (meşru kullanıcıyı kilitlememek için).
 */
export async function checkRateLimit(
  key: string,
  limit: number,
  windowSec: number
): Promise<{ ok: boolean }> {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + windowSec * 1000);
  try {
    const existing = await prisma.rateLimit.findUnique({ where: { key } });
    if (!existing || existing.expiresAt < now) {
      await prisma.rateLimit.upsert({
        where: { key },
        update: { count: 1, expiresAt },
        create: { key, count: 1, expiresAt },
      });
      return { ok: true };
    }
    if (existing.count >= limit) return { ok: false };
    await prisma.rateLimit.update({
      where: { key },
      data: { count: { increment: 1 } },
    });
    return { ok: true };
  } catch {
    return { ok: true };
  }
}

/** Server action'larda kullanılan kısa yardımcı: IP + opsiyonel ek anahtarla limit. */
export async function rateLimitByIp(
  scope: string,
  limit: number,
  windowSec: number,
  extra?: string
): Promise<boolean> {
  const ip = await getClientIp();
  const key = `${scope}:${ip}${extra ? ":" + extra : ""}`;
  const { ok } = await checkRateLimit(key, limit, windowSec);
  return ok;
}
