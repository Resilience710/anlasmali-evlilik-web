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
 * DB tabanlı rate limit (sunucusuz uyumlu) — TEK ATOMİK SQL ifadesi.
 * Eşzamanlı isteklerde yarış koşulu yoktur (INSERT ... ON CONFLICT increment).
 * Pencere dolmuşsa sayaç sıfırlanır; içindeyse artar.
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
    const rows = await prisma.$queryRaw<{ count: number }[]>`
      INSERT INTO "RateLimit" ("key", "count", "expiresAt")
      VALUES (${key}, 1, ${expiresAt})
      ON CONFLICT ("key") DO UPDATE SET
        "count" = CASE WHEN "RateLimit"."expiresAt" < ${now}
                       THEN 1 ELSE "RateLimit"."count" + 1 END,
        "expiresAt" = CASE WHEN "RateLimit"."expiresAt" < ${now}
                           THEN ${expiresAt} ELSE "RateLimit"."expiresAt" END
      RETURNING "count"
    `;
    const count = Number(rows[0]?.count ?? 1);
    return { ok: count <= limit };
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
