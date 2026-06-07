import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import {
  AdminListingsBulk,
  type AdminListingRow,
} from "@/components/admin/listings-bulk";
import { Pagination } from "@/components/ui/pagination";
import {
  LISTING_STATUSES,
  LISTING_STATUS_LABELS,
  type ListingStatus,
} from "@/lib/constants";
import { cn, clamp, timeAgo } from "@/lib/utils";

export const metadata: Metadata = { title: "İlanlar — Yönetim" };

// Onay sistemi kapalı olduğundan Onay Bekliyor/Reddedildi filtreleri gösterilmiyor.
const VISIBLE_STATUSES: ListingStatus[] = ["APPROVED", "ARCHIVED"];
const PER_PAGE = 50;

export default async function AdminListingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const status = sp.status as ListingStatus | undefined;
  const page = clamp(parseInt(sp.page ?? "1", 10) || 1, 1, 100000);

  const where: Prisma.ListingWhereInput = {
    deletedAt: null,
    ...(status && LISTING_STATUSES.includes(status) ? { status } : {}),
  };

  const [listings, total] = await Promise.all([
    prisma.listing.findMany({
      where,
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
      include: {
        category: true,
        city: true,
        author: { select: { profile: { select: { displayName: true } } } },
      },
    }),
    prisma.listing.count({ where }),
  ]);

  const rows: AdminListingRow[] = listings.map((l) => ({
    id: l.id,
    title: l.title,
    status: l.status,
    categoryName: l.category.name,
    authorName: l.author.profile?.displayName ?? "—",
    cityName: l.city.name,
    age: l.age,
    when: timeAgo(l.createdAt),
  }));

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
        {VISIBLE_STATUSES.map((s) => (
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

      <AdminListingsBulk rows={rows} />

      <Pagination
        page={page}
        totalPages={Math.max(1, Math.ceil(total / PER_PAGE))}
        baseQuery={{ status: sp.status }}
      />
    </div>
  );
}
