import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, UserPen } from "lucide-react";
import { requireUser } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { getCatalog } from "@/lib/listings";
import { createListingAction } from "@/app/_actions/listings";
import { ListingForm } from "@/components/listings/listing-form";
import { Button } from "@/components/ui/button";
import { getMissingProfileFields } from "@/lib/profile-completeness";

export const metadata: Metadata = { title: "İlan Oluştur" };

export default async function CreateListingPage() {
  const user = await requireUser();
  const [catalog, profile] = await Promise.all([
    getCatalog(),
    prisma.profile.findUnique({ where: { userId: user.id } }),
  ]);

  const missing = getMissingProfileFields(profile);

  // Profil eksikse ilan oluşturmaya izin verme
  if (missing.length > 0) {
    return (
      <div className="flex flex-col gap-5">
        <div>
          <h1 className="text-2xl font-bold">İlan Oluştur</h1>
        </div>
        <div className="rounded-[var(--radius-card)] border border-warning/30 bg-warning/10 p-6">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-warning/15 text-warning">
              <AlertTriangle className="size-5" />
            </span>
            <div>
              <h2 className="font-semibold text-warning">
                Önce profilinizi tamamlayın
              </h2>
              <p className="mt-1 text-sm text-foreground/90">
                İlan oluşturabilmeniz için profil bilgilerinizin eksiksiz olması
                gerekir. Aşağıdaki alanlar henüz doldurulmamış:
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {missing.map((m) => (
                  <span
                    key={m}
                    className="rounded-md border border-border bg-surface px-2.5 py-1 text-xs"
                  >
                    {m}
                  </span>
                ))}
              </div>
              <Button asChild className="mt-5">
                <Link href="/hesabim/profil">
                  <UserPen />
                  Profil Bilgilerimi Tamamla
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
