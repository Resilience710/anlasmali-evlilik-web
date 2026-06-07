import type { Metadata } from "next";
import { getMembers } from "@/lib/members";
import { getCatalog } from "@/lib/listings";
import { redirectIfBanned } from "@/lib/auth-guards";
import { MemberCard } from "@/components/members/member-card";
import { MemberFilters } from "@/components/members/member-filters";
import { Pagination } from "@/components/ui/pagination";
import { JsonLd } from "@/components/seo/json-ld";
import { absoluteUrl, pageMetadata } from "@/lib/seo";
import { GENDER_LABELS, type Gender } from "@/lib/constants";

function canonicalMemberPath(sp: Record<string, string | undefined>) {
  const params = new URLSearchParams();
  for (const key of ["sehir", "cinsiyet", "yas", "medeni"] as const) {
    if (sp[key]) params.set(key, sp[key]!);
  }
  const query = params.toString();
  return query ? `/uyeler?${query}` : "/uyeler";
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}): Promise<Metadata> {
  const sp = await searchParams;
  const catalog = await getCatalog();
  const city = catalog.cities.find((c) => c.slug === sp.sehir)?.name;
  const gender =
    sp.cinsiyet && sp.cinsiyet in GENDER_LABELS
      ? GENDER_LABELS[sp.cinsiyet as Gender]
      : undefined;
  const parts = [city, gender, sp.yas && `${sp.yas} yaş`, sp.medeni].filter(Boolean);
  const title =
    parts.length > 0
      ? `${parts.join(" ")} Evlilik Üyeleri`
      : "Ciddi Evlilik Üyeleri ve Eş Adayları";

  return pageMetadata({
    title,
    description:
      parts.length > 0
        ? `${parts.join(", ")} kriterlerine uygun ciddi evlilik üyelerini inceleyin. Güvenli profil ve evlilik ilanları platformu.`
        : "Ciddi ilişki ve evlilik düşünen üyeleri şehir, yaş ve profil bilgilerine göre keşfedin.",
    path: sp.page ? "/uyeler" : canonicalMemberPath(sp),
    keywords: [
      "evlilik üyeleri",
      "eş adayı bul",
      "ciddi ilişki üyeleri",
      "evlenmek isteyenler",
    ],
    noIndex: Boolean(sp.page),
  });
}

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
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Ciddi evlilik üyeleri",
          description:
            "Ciddi ilişki ve evlilik düşünen üyelerin herkese açık profilleri.",
          url: absoluteUrl(canonicalMemberPath(sp)),
          inLanguage: "tr-TR",
          mainEntity: {
            "@type": "ItemList",
            numberOfItems: items.length,
            itemListElement: items.map((member, index) => ({
              "@type": "ListItem",
              position: (page - 1) * 12 + index + 1,
              url: absoluteUrl(`/uyeler/${member.id}`),
              name: member.displayName,
            })),
          },
        }}
      />
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
