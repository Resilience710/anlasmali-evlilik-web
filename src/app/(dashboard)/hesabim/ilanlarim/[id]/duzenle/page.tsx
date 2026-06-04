import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { getCatalog } from "@/lib/listings";
import { updateListingAction } from "@/app/_actions/listings";
import { ListingForm } from "@/components/listings/listing-form";

export const metadata: Metadata = { title: "İlanı Düzenle" };

export default async function EditListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;

  const [listing, catalog] = await Promise.all([
    prisma.listing.findUnique({ where: { id } }),
    getCatalog(),
  ]);

  if (!listing || listing.authorId !== user.id || listing.deletedAt) {
    notFound();
  }

  const boundAction = updateListingAction.bind(null, id);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-bold">İlanı Düzenle</h1>
        <p className="text-sm text-muted-foreground">
          Değişiklikler sonrası ilan yeniden onaya gönderilir.
        </p>
      </div>
      <div className="rounded-[var(--radius-card)] border border-border bg-surface p-6">
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
