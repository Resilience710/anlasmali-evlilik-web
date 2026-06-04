import type { Metadata } from "next";
import { getListings, getCatalog } from "@/lib/listings";
import { ListingCard } from "@/components/listings/listing-card";
import { ListingFilters } from "@/components/listings/listing-filters";
import { Pagination } from "@/components/ui/pagination";

export const metadata: Metadata = { title: "İlanlar" };

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const [minAge, maxAge] = (sp.yas ?? "").split("-").map((n) => parseInt(n, 10));

  const [{ items, total, page, totalPages }, catalog] = await Promise.all([
    getListings({
      kategori: sp.kategori,
      sehir: sp.sehir,
      cinsiyet: sp.cinsiyet,
      minAge: Number.isFinite(minAge) ? minAge : undefined,
      maxAge: Number.isFinite(maxAge) ? maxAge : undefined,
      q: sp.q,
      page: sp.page ? parseInt(sp.page, 10) : 1,
    }),
    getCatalog(),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <div className="mb-5">
        <h1 className="text-2xl font-bold">İlanlar</h1>
        <p className="text-sm text-muted-foreground">
          Toplam {total} ilan listeleniyor.
        </p>
      </div>

      <div className="mb-5">
        <ListingFilters
          categories={catalog.categories}
          cities={catalog.cities}
          ageOptions={catalog.ageOptions}
          current={{
            kategori: sp.kategori,
            sehir: sp.sehir,
            cinsiyet: sp.cinsiyet,
            yas: sp.yas,
          }}
        />
      </div>

      {items.length === 0 ? (
        <div className="rounded-[var(--radius-card)] border border-border bg-surface p-10 text-center text-muted-foreground">
          Bu kriterlere uygun ilan bulunamadı.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((l) => (
            <ListingCard key={l.id} listing={l} />
          ))}
        </div>
      )}

      <div className="mt-8">
        <Pagination
          page={page}
          totalPages={totalPages}
          baseQuery={{
            kategori: sp.kategori,
            sehir: sp.sehir,
            cinsiyet: sp.cinsiyet,
            yas: sp.yas,
            q: sp.q,
          }}
        />
      </div>
    </div>
  );
}
