import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCatalog } from "@/lib/listings";
import { updateListingAdminAction } from "@/app/_actions/admin";
import { ListingForm } from "@/components/listings/listing-form";
import { AdminListingActions } from "@/components/admin/listing-actions";

export const metadata: Metadata = { title: "İlan Düzenle — Yönetim" };

export default async function AdminListingEdit({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [listing, catalog] = await Promise.all([
    prisma.listing.findUnique({ where: { id } }),
    getCatalog(),
  ]);
  if (!listing) notFound();

  const boundAction = updateListingAdminAction.bind(null, id);

  return (
    <div className="flex flex-col gap-5">
      <Link href="/admin/ilanlar" className="text-sm text-muted-foreground hover:text-foreground">
        ← İlanlar
      </Link>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">İlanı Yönet</h1>
        <AdminListingActions id={listing.id} status={listing.status} />
      </div>
      <div className="rounded-[var(--radius-card)] border border-border bg-surface p-4 sm:p-6">
        <ListingForm
          action={boundAction}
          categories={catalog.categories}
          cities={catalog.cities}
          submitLabel="Değişiklikleri Kaydet"
          defaults={{
            title: listing.title,
            description: listing.description,
            categoryId: listing.categoryId,
            cityId: listing.cityId,
            age: listing.age,
            gender: listing.gender,
            targetGender: listing.targetGender,
            imageUrl: listing.imageUrl,
          }}
        />
      </div>
    </div>
  );
}
