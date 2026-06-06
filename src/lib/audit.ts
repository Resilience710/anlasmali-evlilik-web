import { prisma } from "@/lib/prisma";

/** Admin işlemleri için denetim izi kaydı (hata ana akışı bozmaz). */
export async function logAudit(
  actorId: string | null,
  action: string,
  opts?: { targetType?: string; targetId?: string; detail?: string }
): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        actorId: actorId ?? null,
        action,
        targetType: opts?.targetType ?? null,
        targetId: opts?.targetId ?? null,
        detail: opts?.detail ?? null,
      },
    });
  } catch {
    /* denetim kaydı başarısız olsa bile işlemi engelleme */
  }
}
