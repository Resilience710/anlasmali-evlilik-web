import type { Metadata } from "next";
import { requireUser } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { getCatalog } from "@/lib/listings";
import { createListingAction } from "@/app/_actions/listings";
import { ListingForm } from "@/components/listings/listing-form";

export const metadata: Metadata = { title: "İlan Oluştur" };

export default async function CreateListingPage() {
  const user = await requireUser();
  const [catalog, profile] = await Promise.all([
    getCatalog(),
    prisma.profile.findUnique({
      where: { userId: user.id },
      select: { gender: true, age: true, cityId: true },
    }),
  ]);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-bold">İlan Oluştur</h1>
        <p className="text-sm text-muted-foreground">
          Sizi tanıtan bir ilan oluşturun, doğru kişiyle tanışın.
        </p>
      </div>
      <div className="rounded-[var(--radius-card)] border border-border bg-surface p-6">
        <ListingForm
          action={createListingAction}
          categories={catalog.categories}
          cities={catalog.cities}
          defaults={{
            gender: profile?.gender ?? undefined,
            age: profile?.age ?? undefined,
            cityId: profile?.cityId ?? undefined,
          }}
        />
      </div>
    </div>
  );
}
