import type { Metadata } from "next";
import { getMembers } from "@/lib/members";
import { redirectIfBanned } from "@/lib/auth-guards";
import { MemberRow } from "@/components/members/member-row";
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
    title: "Ciddi Evlilik Üyeleri ve Eş Adayları",
    description:
      "Ciddi ilişki ve evlilik düşünen üyeleri keşfedin.",
    path: "/uyeler",
    keywords: ["evlilik üyeleri", "eş adayı bul", "evlenmek isteyenler"],
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
  const { items, total, page, totalPages } = await getMembers({
    page: sp.page ? parseInt(sp.page, 10) : 1,
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Ciddi evlilik üyeleri",
          description:
            "Ciddi ilişki ve evlilik düşünen üyelerin herkese açık profilleri.",
          url: absoluteUrl("/uyeler"),
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

      {items.length === 0 ? (
        <div className="rounded-[var(--radius-card)] border border-border bg-surface p-10 text-center text-muted-foreground">
          Üye bulunamadı.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((m) => (
            <MemberRow key={m.id} member={m} />
          ))}
        </div>
      )}

      <div className="mt-8">
        <Pagination page={page} totalPages={totalPages} baseQuery={{}} />
      </div>
    </div>
  );
}
