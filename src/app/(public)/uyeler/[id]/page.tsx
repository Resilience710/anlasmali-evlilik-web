import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, Cake, User2, Search, BadgeCheck } from "lucide-react";
import { auth } from "@/auth";
import { redirectIfBanned } from "@/lib/auth-guards";
import { getMemberProfile } from "@/lib/members";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ListingCard } from "@/components/listings/listing-card";
import { ReportDialog } from "@/components/listings/report-dialog";
import { GENDER_LABELS, type Gender } from "@/lib/constants";
import { initials, timeAgo } from "@/lib/utils";
import { JsonLd } from "@/components/seo/json-ld";
import { absoluteUrl, pageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const data = await getMemberProfile(id);
  if (!data?.user.profile) {
    return pageMetadata({
      title: "Üye Profili",
      description: "Üye profili bulunamadı.",
      path: "/uyeler",
      noIndex: true,
    });
  }

  const p = data.user.profile;
  const details = [
    p.city?.name,
    p.age && `${p.age} yaş`,
    p.gender && GENDER_LABELS[p.gender as Gender],
    p.lookingFor && `${GENDER_LABELS[p.lookingFor as Gender]} arıyor`,
  ].filter(Boolean);

  return pageMetadata({
    title: `${p.displayName} - Ciddi Evlilik Profili`,
    description: `${p.displayName} kullanıcısının ciddi evlilik profili. ${details.join(", ")}. ${p.bio ?? "Evlilik ve ciddi ilişki amacıyla üye olmuş profil."}`,
    path: `/uyeler/${id}`,
    keywords: [
      `${p.displayName} evlilik profili`,
      p.city?.name ? `${p.city.name} evlilik üyeleri` : "evlilik üyeleri",
      "eş adayı profili",
    ],
  });
}

export default async function MemberProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await redirectIfBanned();
  const { id } = await params;
  const data = await getMemberProfile(id);
  if (!data) notFound();

  const session = await auth();
  const isSelf = session?.user?.id === id;
  const p = data.user.profile;
  const name = p?.displayName ?? "Üye";

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Person",
          name,
          url: absoluteUrl(`/uyeler/${id}`),
          description:
            p?.bio ?? "Ciddi evlilik ve ilişki amacıyla oluşturulmuş üye profili.",
          gender: p?.gender ? GENDER_LABELS[p.gender as Gender] : undefined,
          homeLocation: p?.city?.name
            ? { "@type": "Place", name: p.city.name }
            : undefined,
          knowsAbout: ["ciddi evlilik", "hayat arkadaşı", "evlilik ilanları"],
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Ana Sayfa",
              item: absoluteUrl("/"),
            },
            {
              "@type": "ListItem",
              position: 2,
              name: "Üyeler",
              item: absoluteUrl("/uyeler"),
            },
            {
              "@type": "ListItem",
              position: 3,
              name,
              item: absoluteUrl(`/uyeler/${id}`),
            },
          ],
        }}
      />
      <div className="rounded-[var(--radius-card)] border border-border bg-surface p-4 sm:p-6">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
          <Avatar className="h-24 w-24">
            {p?.avatarUrl && <AvatarImage src={p.avatarUrl} alt={name} />}
            <AvatarFallback className="text-2xl">
              {initials(name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 text-center sm:text-left">
            <h1 className="inline-flex items-center gap-1.5 text-2xl font-bold">
              {name}
              {data.user.emailVerified && (
                <BadgeCheck
                  className="size-5 text-primary"
                  aria-label="Doğrulanmış üye"
                />
              )}
            </h1>
            {p?.username && (
              <p className="text-sm text-primary">@{p.username}</p>
            )}
            <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm text-muted-foreground sm:justify-start">
              {p?.gender && (
                <span className="inline-flex items-center gap-1.5">
                  <User2 className="size-4" /> {GENDER_LABELS[p.gender as Gender]}
                </span>
              )}
              {p?.age && (
                <span className="inline-flex items-center gap-1.5">
                  <Cake className="size-4" /> {p.age} yaş
                </span>
              )}
              {p?.city?.name && (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="size-4" /> {p.city.name}
                </span>
              )}
              {p?.lookingFor && (
                <span className="inline-flex items-center gap-1.5">
                  <Search className="size-4" /> Aradığı:{" "}
                  {GENDER_LABELS[p.lookingFor as Gender]}
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Üyelik: {timeAgo(data.user.createdAt)}
            </p>
            {p?.bio && (
              <p className="mt-3 break-words text-sm text-foreground/90">{p.bio}</p>
            )}
          </div>
          {!isSelf && (
            <div className="flex flex-col gap-2">
              {session?.user?.id && (
                <ReportDialog targetType="USER" reportedUserId={id} />
              )}
            </div>
          )}
        </div>
      </div>

      {(() => {
        const details: [string, string | null][] = [
          ["Meslek", p?.profession ?? null],
          ["Ünvan", p?.jobTitle ?? null],
          ["Eğitim", p?.education ?? null],
          ["Medeni Hal", p?.maritalStatus ?? null],
          ["Vücut Tipi", p?.bodyType ?? null],
          ["Burç", p?.zodiac ?? null],
          ["Boy", p?.height ? `${p.height} cm` : null],
          ["Kilo", p?.weight ? `${p.weight} kg` : null],
          ["Sigara", p?.smoking ?? null],
          ["Alkol", p?.alcohol ?? null],
        ];
        const shown = details.filter(([, val]) => val);
        if (shown.length === 0) return null;
        return (
          <div className="mt-5 rounded-[var(--radius-card)] border border-border bg-surface p-4 sm:p-6">
            <h2 className="mb-4 font-semibold">Detaylar</h2>
            <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {shown.map(([label, val]) => (
                <div key={label}>
                  <dt className="text-xs text-muted-foreground">{label}</dt>
                  <dd className="text-sm font-medium">{val}</dd>
                </div>
              ))}
            </dl>
          </div>
        );
      })()}

      <h2 className="mb-3 mt-6 text-lg font-semibold">
        {name} kullanıcısının ilanları
      </h2>
      {data.listings.length === 0 ? (
        <p className="rounded-[var(--radius-card)] border border-border bg-surface p-8 text-center text-sm text-muted-foreground">
          Yayında ilan yok.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.listings.map((l) => (
            <ListingCard key={l.id} listing={l} />
          ))}
        </div>
      )}

      <div className="mt-6">
        <Button asChild variant="outline">
          <Link href="/uyeler">← Tüm Üyeler</Link>
        </Button>
      </div>
    </div>
  );
}
