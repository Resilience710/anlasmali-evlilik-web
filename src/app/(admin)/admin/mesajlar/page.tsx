import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { ReportStatusSelect } from "@/components/admin/report-status-select";
import { CatalogDeleteButton } from "@/components/admin/simple-action-buttons";
import { REPORT_STATUS_LABELS, type ReportStatus } from "@/lib/constants";
import { timeAgo } from "@/lib/utils";

export const metadata: Metadata = { title: "Mesaj Şikayetleri — Yönetim" };

// Gizlilik: Yöneticiler kullanıcıların tüm özel mesajlarını GÖRMEZ.
// Yalnızca bir kullanıcı tarafından şikayet edilen mesajlar burada görünür
// (sektör standardı + KVKK uyumu).
export default async function AdminReportedMessagesPage() {
  const reports = await prisma.report.findMany({
    where: { targetType: "MESSAGE" },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    take: 100,
    include: {
      reporter: { select: { profile: { select: { displayName: true } } } },
      reportedUser: {
        select: { id: true, profile: { select: { displayName: true } } },
      },
      message: {
        select: { id: true, body: true, deletedAt: true, createdAt: true },
      },
    },
  });

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-bold">Mesaj Şikayetleri</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Gizlilik gereği özel mesajların tamamı görüntülenmez; yalnızca üyeler
          tarafından <strong>şikayet edilen</strong> mesajlar burada listelenir.
          Uygunsuz mesajı silebilir, göndereni yönetebilirsiniz.
        </p>
      </div>

      {reports.length === 0 ? (
        <div className="rounded-[var(--radius-card)] border border-border bg-surface p-10 text-center text-muted-foreground">
          Şikayet edilen mesaj yok.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {reports.map((r) => (
            <div
              key={r.id}
              className="flex flex-col gap-3 rounded-[var(--radius-card)] border border-border bg-surface p-4 lg:flex-row lg:items-start lg:justify-between"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="destructive">{r.reason}</Badge>
                  <Badge
                    variant={
                      r.status === "RESOLVED"
                        ? "success"
                        : r.status === "OPEN"
                        ? "warning"
                        : "neutral"
                    }
                  >
                    {REPORT_STATUS_LABELS[r.status as ReportStatus]}
                  </Badge>
                </div>

                {/* Şikayet edilen mesaj içeriği */}
                <div className="mt-2 flex items-start gap-3 rounded-lg border border-border bg-surface-2 p-3">
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">
                      Gönderen:{" "}
                      {r.reportedUser ? (
                        <Link
                          href={`/admin/uyeler/${r.reportedUser.id}`}
                          className="text-primary hover:underline"
                        >
                          {r.reportedUser.profile?.displayName ?? "—"}
                        </Link>
                      ) : (
                        "—"
                      )}
                    </p>
                    <p className="mt-1 break-words text-sm text-foreground/90">
                      {r.message?.deletedAt
                        ? "(mesaj silinmiş)"
                        : r.message?.body ?? "(mesaj bulunamadı)"}
                    </p>
                  </div>
                </div>

                {r.detail && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    Açıklama: {r.detail}
                  </p>
                )}
                <p className="mt-1 text-xs text-muted-foreground">
                  Şikayet eden: {r.reporter.profile?.displayName ?? "—"} ·{" "}
                  {timeAgo(r.createdAt)}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <ReportStatusSelect id={r.id} status={r.status} />
                {r.message && !r.message.deletedAt && (
                  <CatalogDeleteButton kind="message" id={r.message.id} />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
