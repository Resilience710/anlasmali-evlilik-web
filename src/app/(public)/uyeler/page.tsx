import type { Metadata } from "next";
import { getMembers } from "@/lib/members";
import { getCatalog } from "@/lib/listings";
import { redirectIfBanned } from "@/lib/auth-guards";
import { MemberCard } from "@/components/members/member-card";
import { MemberFilters } from "@/components/members/member-filters";
import { Pagination } from "@/components/ui/pagination";

export const metadata: Metadata = { title: "Üyeler" };

export default async function MembersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await redirectIfBanned();
  const sp = await searchParams;
  const [minAge, maxAge] = (sp.yas ?? "").split("-").map((n) => parseInt(n, 10));
  const [{ items, total, page, totalPages }, catalog] = await Promise.all([
    getMembers({
      sehir: sp.sehir,
      cinsiyet: sp.cinsiyet,
      medeni: sp.medeni,
      vucut: sp.vucut,
      sigara: sp.sigara,
      minAge: Number.isFinite(minAge) ? minAge : undefined,
      maxAge: Number.isFinite(maxAge) ? maxAge : undefined,
      page: sp.page ? parseInt(sp.page, 10) : 1,
    }),
    getCatalog(),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <div className="mb-5">
        <h1 className="text-2xl font-bold">Üyeler</h1>
        <p className="text-sm text-muted-foreground">{total} üye</p>
      </div>

      <div className="mb-5">
        <MemberFilters
          cities={catalog.cities}
          ageOptions={catalog.ageOptions}
          current={{
            sehir: sp.sehir,
            cinsiyet: sp.cinsiyet,
            yas: sp.yas,
            medeni: sp.medeni,
            vucut: sp.vucut,
            sigara: sp.sigara,
          }}
        />
      </div>

      {items.length === 0 ? (
        <div className="rounded-[var(--radius-card)] border border-border bg-surface p-10 text-center text-muted-foreground">
          Üye bulunamadı.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {items.map((m) => (
            <MemberCard key={m.id} member={m} />
          ))}
        </div>
      )}

      <div className="mt-8">
        <Pagination
          page={page}
          totalPages={totalPages}
          baseQuery={{
            sehir: sp.sehir,
            cinsiyet: sp.cinsiyet,
            yas: sp.yas,
            medeni: sp.medeni,
            vucut: sp.vucut,
            sigara: sp.sigara,
          }}
        />
      </div>
    </div>
  );
}
