import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { timeAgo } from "@/lib/utils";

export const metadata: Metadata = { title: "Denetim Kayıtları — Yönetim" };

export default async function AuditLogPage() {
  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  const actorIds = [
    ...new Set(logs.map((l) => l.actorId).filter(Boolean) as string[]),
  ];
  const profiles = actorIds.length
    ? await prisma.profile.findMany({
        where: { userId: { in: actorIds } },
        select: { userId: true, displayName: true },
      })
    : [];
  const nameMap = new Map(profiles.map((p) => [p.userId, p.displayName]));

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-bold">Denetim Kayıtları</h1>
        <p className="text-sm text-muted-foreground">
          Yönetici işlemlerinin son 100 kaydı (KVKK denetim izi).
        </p>
      </div>

      {logs.length === 0 ? (
        <div className="rounded-[var(--radius-card)] border border-border bg-surface p-10 text-center text-muted-foreground">
          Henüz kayıt yok.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-[var(--radius-card)] border border-border">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-surface-2 text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Tarih</th>
                <th className="px-4 py-3">Yönetici</th>
                <th className="px-4 py-3">İşlem</th>
                <th className="px-4 py-3">Hedef</th>
                <th className="px-4 py-3">Detay</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {logs.map((l) => (
                <tr key={l.id} className="bg-surface">
                  <td className="px-4 py-3 text-muted-foreground">
                    {timeAgo(l.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    {l.actorId ? nameMap.get(l.actorId) ?? "—" : "Sistem"}
                  </td>
                  <td className="px-4 py-3 font-medium">{l.action}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {l.targetType ?? "—"}
                  </td>
                  <td className="max-w-[280px] truncate px-4 py-3 text-muted-foreground" title={l.detail ?? undefined}>
                    {l.detail ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
