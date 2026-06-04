import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { CategoryBadge } from "@/components/listings/category-badge";
import { AdminListingActions } from "@/components/admin/listing-actions";
import {
  LISTING_STATUSES,
  LISTING_STATUS_LABELS,
  type ListingStatus,
} from "@/lib/constants";
import { cn, timeAgo } from "@/lib/utils";

export const metadata: Metadata = { title: "İlanlar — Yönetim" };

const statusVariant: Record<ListingStatus, "success" | "warning" | "destructive" | "neutral"> = {
  APPROVED: "success",
  PENDING: "warning",
  REJECTED: "destructive",
  ARCHIVED: "neutral",
};

export default async function AdminListingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const sp = await searchParams;
  const status = sp.status as ListingStatus | undefined;

  const where: Prisma.ListingWhereInput = {
    deletedAt: null,
    ...(status && LISTING_STATUSES.includes(status) ? { status } : {}),
  };

  const listings = await prisma.listing.findMany({
    where,
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    take: 100,
    include: {
      category: true,
      city: true,
      author: { select: { profile: { select: { displayName: true } } } },
    },
  });

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-2xl font-bold">İlanlar</h1>

      <div className="flex flex-wrap gap-2">
        <Link
          href="/admin/ilanlar"
          className={cn(
            "rounded-lg border px-3 py-1.5 text-sm",
            !status ? "border-primary bg-primary-soft text-primary" : "border-border hover:bg-elevated"
          )}
        >
          Tümü
        </Link>
        {LISTING_STATUSES.map((s) => (
          <Link
            key={s}
            href={`/admin/ilanlar?status=${s}`}
            className={cn(
              "rounded-lg border px-3 py-1.5 text-sm",
              status === s ? "border-primary bg-primary-soft text-primary" : "border-border hover:bg-elevated"
            )}
          >
            {LISTING_STATUS_LABELS[s]}
          </Link>
        ))}
      </div>

      {listings.length === 0 ? (
        <div className="rounded-[var(--radius-card)] border border-border bg-surface p-10 text-center text-muted-foreground">
          İlan bulunamadı.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {listings.map((l) => (
            <div
              key={l.id}
              className="flex flex-col gap-3 rounded-[var(--radius-card)] border border-border bg-surface p-4 lg:flex-row lg:items-center lg:justify-between"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={statusVariant[l.status as ListingStatus]}>
                    {LISTING_STATUS_LABELS[l.status as ListingStatus]}
                  </Badge>
                  <CategoryBadge name={l.category.name} slug={l.category.slug} />
                </div>
                <Link
                  href={`/admin/ilanlar/${l.id}`}
                  className="mt-1.5 block font-medium hover:text-primary"
                >
                  {l.title}
                </Link>
                <p className="text-xs text-muted-foreground">
                  {l.author.profile?.displayName ?? "—"} · {l.city.name} ·{" "}
                  {l.age} yaş · {timeAgo(l.createdAt)}
                </p>
              </div>
              <AdminListingActions id={l.id} status={l.status} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
