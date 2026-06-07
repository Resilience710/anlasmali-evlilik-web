import type { Metadata } from "next";
import { getListings, getCatalog } from "@/lib/listings";
import { redirectIfBanned } from "@/lib/auth-guards";
import { ListingCard } from "@/components/listings/listing-card";
import { ListingFilters } from "@/components/listings/listing-filters";
import { Pagination } from "@/components/ui/pagination";
import { JsonLd } from "@/components/seo/json-ld";
import { absoluteUrl, pageMetadata } from "@/lib/seo";
import { GENDER_LABELS, type Gender } from "@/lib/constants";

function canonicalListingPath(sp: Record<string, string | undefined>) {
  const params = new URLSearchParams();
  for (const key of ["kategori", "sehir", "cinsiyet", "yas"] as const) {
    if (sp[key]) params.set(key, sp[key]!);
  }
  const query = params.toString();
  return query ? `/ilanlar?${query}` : "/ilanlar";
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}): Promise<Metadata> {
  const sp = await searchParams;
  const catalog = await getCatalog();
  const category = catalog.categories.find((c) => c.slug === sp.kategori)?.name;
  const city = catalog.cities.find((c) => c.slug === sp.sehir)?.name;
  const gender =
    sp.cinsiyet && sp.cinsiyet in GENDER_LABELS
      ? GENDER_LABELS[sp.cinsiyet as Gender]
      : undefined;
  const parts = [city, category, gender && `${gender} arayanlar`, sp.yas && `${sp.yas} yaş`].filter(Boolean);
  const title =
    parts.length > 0
      ? `${parts.join(" ")} Evlilik İlanları`
      : "Evlilik İlanları ve Ciddi Evlilik Adayları";

  return pageMetadata({
    title,
    description:
      parts.length > 0
        ? `${parts.join(", ")} kriterlerine uygun ciddi evlilik ilanlarını inceleyin. Türkiye geneli güvenli tanışma ve anlaşmalı evlilik ilanları.`
        : "Türkiye geneli ciddi evlilik ilanlarını inceleyin. Şehir, yaş, kategori ve cinsiyete göre anlaşmalı evlilik ve hayat arkadaşı ilanları.",
    path: sp.q || sp.page ? "/ilanlar" : canonicalListingPath(sp),
    keywords: [
      "ciddi evlilik ilanları",
      "bay arayan bayanlar",
      "bayan arayan erkekler",
      "şehir evlilik ilanları",
    ],
    noIndex: Boolean(sp.q || sp.page),
  });
}

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await redirectIfBanned();
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
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Evlilik ilanları",
          description:
            "Türkiye geneli ciddi evlilik ve anlaşmalı evlilik ilanları.",
          url: absoluteUrl(canonicalListingPath(sp)),
          inLanguage: "tr-TR",
          mainEntity: {
            "@type": "ItemList",
            numberOfItems: items.length,
            itemListElement: items.map((listing, index) => ({
              "@type": "ListItem",
              position: (page - 1) * 12 + index + 1,
              url: absoluteUrl(`/ilanlar/${listing.slug}`),
              name: listing.title,
            })),
          },
        }}
      />
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
