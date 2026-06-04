import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { ReportStatusSelect } from "@/components/admin/report-status-select";
import { REPORT_STATUS_LABELS, type ReportStatus } from "@/lib/constants";
import { timeAgo } from "@/lib/utils";

export const metadata: Metadata = { title: "Şikayetler — Yönetim" };

export default async function AdminReportsPage() {
  const reports = await prisma.report.findMany({
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    take: 100,
    include: {
      reporter: { select: { profile: { select: { displayName: true } } } },
      listing: { select: { title: true, slug: true } },
      reportedUser: { select: { id: true, profile: { select: { displayName: true } } } },
    },
  });

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-2xl font-bold">Şikayetler</h1>

      {reports.length === 0 ? (
        <div className="rounded-[var(--radius-card)] border border-border bg-surface p-10 text-center text-muted-foreground">
          Şikayet yok.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {reports.map((r) => (
            <div
              key={r.id}
              className="flex flex-col gap-3 rounded-[var(--radius-card)] border border-border bg-surface p-4 lg:flex-row lg:items-center lg:justify-between"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="neutral">{r.targetType}</Badge>
                  <span className="font-medium">{r.reason}</span>
                </div>
                {r.detail && (
                  <p className="mt-1 text-sm text-muted-foreground">{r.detail}</p>
                )}
                <p className="mt-1 text-xs text-muted-foreground">
                  Şikayet eden: {r.reporter.profile?.displayName ?? "—"} ·{" "}
                  {timeAgo(r.createdAt)}
                  {r.listing && (
                    <>
                      {" · "}
                      <Link href={`/ilanlar/${r.listing.slug}`} className="text-primary hover:underline">
                        İlan: {r.listing.title}
                      </Link>
                    </>
                  )}
                  {r.reportedUser && (
                    <>
                      {" · "}
                      <Link href={`/admin/uyeler/${r.reportedUser.id}`} className="text-primary hover:underline">
                        Üye: {r.reportedUser.profile?.displayName ?? "—"}
                      </Link>
                    </>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-2">
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
                <ReportStatusSelect id={r.id} status={r.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
