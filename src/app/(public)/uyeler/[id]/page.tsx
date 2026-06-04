import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, Cake, User2, Search } from "lucide-react";
import { auth } from "@/auth";
import { getMemberProfile } from "@/lib/members";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ListingCard } from "@/components/listings/listing-card";
import { ReportDialog } from "@/components/listings/report-dialog";
import { GENDER_LABELS, type Gender } from "@/lib/constants";
import { initials, timeAgo } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const data = await getMemberProfile(id);
  return { title: data?.user.profile?.displayName ?? "Üye Profili" };
}

export default async function MemberProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getMemberProfile(id);
  if (!data) notFound();

  const session = await auth();
  const isSelf = session?.user?.id === id;
  const p = data.user.profile;
  const name = p?.displayName ?? "Üye";

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
      <div className="rounded-[var(--radius-card)] border border-border bg-surface p-6">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
          <Avatar className="h-24 w-24">
            {p?.avatarUrl && <AvatarImage src={p.avatarUrl} alt={name} />}
            <AvatarFallback className="text-2xl">
              {initials(name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-2xl font-bold">{name}</h1>
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
              <p className="mt-3 text-sm text-foreground/90">{p.bio}</p>
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
