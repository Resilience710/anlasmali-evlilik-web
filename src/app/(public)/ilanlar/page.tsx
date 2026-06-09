import type { Metadata } from "next";
import { getListings } from "@/lib/listings";
import { redirectIfBanned } from "@/lib/auth-guards";
import { ListingRow } from "@/components/listings/listing-row";
import { Pagination } from "@/components/ui/pagination";
import { JsonLd } from "@/components/seo/json-ld";
import { absoluteUrl, pageMetadata } from "@/lib/seo";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}): Promise<Metadata> {
  const sp = await searchParams;
  return pageMetadata({
    title: "Evlilik İlanları ve Ciddi Evlilik Adayları",
    description:
      "Türkiye geneli ciddi evlilik ilanlarını inceleyin. Anlaşmalı evlilik ve hayat arkadaşı ilanları.",
    path: "/ilanlar",
    keywords: ["ciddi evlilik ilanları", "evlilik ilanı", "hayat arkadaşı"],
    noIndex: Boolean(sp.page),
  });
}

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await redirectIfBanned();
  const sp = await searchParams;

  const { items, total, page, totalPages } = await getListings({
    page: sp.page ? parseInt(sp.page, 10) : 1,
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Evlilik ilanları",
          description:
            "Türkiye geneli ciddi evlilik ve anlaşmalı evlilik ilanları.",
          url: absoluteUrl("/ilanlar"),
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

      {items.length === 0 ? (
        <div className="rounded-[var(--radius-card)] border border-border bg-surface p-10 text-center text-muted-foreground">
          Henüz ilan yok.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((l) => (
            <ListingRow key={l.id} listing={l} />
          ))}
        </div>
      )}

      <div className="mt-8">
        <Pagination page={page} totalPages={totalPages} baseQuery={{}} />
      </div>
    </div>
  );
}
