import type { Metadata } from "next";
import Link from "next/link";
import { Pencil, Eye, PlusCircle } from "lucide-react";
import { requireUser } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CategoryBadge } from "@/components/listings/category-badge";
import { DeleteListingButton } from "@/components/dashboard/delete-listing-button";
import { LISTING_STATUS_LABELS, type ListingStatus } from "@/lib/constants";
import { timeAgo } from "@/lib/utils";

export const metadata: Metadata = { title: "İlanlarım" };

const statusVariant: Record<ListingStatus, "success" | "warning" | "destructive" | "neutral"> = {
  APPROVED: "success",
  PENDING: "warning",
  REJECTED: "destructive",
  ARCHIVED: "neutral",
};

export default async function MyListingsPage() {
  const user = await requireUser();
  const listings = await prisma.listing.findMany({
    where: { authorId: user.id, deletedAt: null },
    orderBy: { createdAt: "desc" },
    include: { category: true, city: true },
  });

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">İlanlarım</h1>
          <p className="text-sm text-muted-foreground">
            {listings.length} ilan
          </p>
        </div>
        <Button asChild size="sm">
          <Link href="/hesabim/ilan-olustur">
            <PlusCircle />
            Yeni İlan
          </Link>
        </Button>
      </div>

      {listings.length === 0 ? (
        <div className="rounded-[var(--radius-card)] border border-border bg-surface p-6 text-center sm:p-10">
          <p className="text-muted-foreground">Henüz ilanınız yok.</p>
          <Button asChild className="mt-4">
            <Link href="/hesabim/ilan-olustur">İlk İlanınızı Oluşturun</Link>
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {listings.map((l) => {
            const status = l.status as ListingStatus;
            return (
              <div
                key={l.id}
                className="flex flex-col gap-3 rounded-[var(--radius-card)] border border-border bg-surface p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={statusVariant[status]}>
                      {LISTING_STATUS_LABELS[status]}
                    </Badge>
                    <CategoryBadge name={l.category.name} slug={l.category.slug} />
                  </div>
                  <p className="mt-1.5 font-medium">{l.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {l.city.name} · {l.age} yaş · {timeAgo(l.createdAt)} ·{" "}
                    {l.viewCount} görüntülenme
                  </p>
                  {status === "REJECTED" && l.rejectReason && (
                    <p className="mt-1 text-xs text-destructive">
                      Ret nedeni: {l.rejectReason}
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 sm:shrink-0">
                  {status === "APPROVED" && (
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/ilanlar/${l.slug}`}>
                        <Eye />
                        Gör
                      </Link>
                    </Button>
                  )}
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/hesabim/ilanlarim/${l.id}/duzenle`}>
                      <Pencil />
                      Düzenle
                    </Link>
                  </Button>
                  <DeleteListingButton listingId={l.id} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
