import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Cake, MapPin, Clock, Eye, User2, Search } from "lucide-react";
import { auth } from "@/auth";
import { redirectIfBanned } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { getListingBySlug } from "@/lib/listings";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { CategoryBadge } from "@/components/listings/category-badge";
import { FavoriteButton } from "@/components/listings/favorite-button";
import { ReportDialog } from "@/components/listings/report-dialog";
import { MessageCompose } from "@/components/messaging/message-compose";
import { Badge } from "@/components/ui/badge";
import { LISTING_STATUS_LABELS, GENDER_LABELS } from "@/lib/constants";
import { getMissingProfileFields } from "@/lib/profile-completeness";
import { initials, timeAgo } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const listing = await getListingBySlug(slug);
  // Yayında olmayan ilanların başlığı metadata'da sızmasın
  return {
    title: listing && listing.status === "APPROVED" ? listing.title : "İlan",
  };
}

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await redirectIfBanned();
  const { slug } = await params;
  const listing = await getListingBySlug(slug);
  if (!listing) notFound();

  const session = await auth();
  const userId = session?.user?.id;
  const isAdmin = session?.user?.role === "ADMIN";
  const isOwner = userId === listing.authorId;

  if (listing.status !== "APPROVED" && !isOwner && !isAdmin) {
    notFound();
  }

  // Görüntülenme sayısı (sahibi dışında)
  if (!isOwner) {
    await prisma.listing
      .update({
        where: { id: listing.id },
        data: { viewCount: { increment: 1 } },
      })
      .catch(() => {});
  }

  let isFavorited = false;
  if (userId) {
    const fav = await prisma.favorite.findUnique({
      where: { userId_listingId: { userId, listingId: listing.id } },
    });
    isFavorited = !!fav;
  }

  let profileIncomplete = false;
  if (userId && !isOwner) {
    const myProfile = await prisma.profile.findUnique({ where: { userId } });
    profileIncomplete = getMissingProfileFields(myProfile).length > 0;
  }

  const authorName = listing.author.profile?.displayName ?? "Üye";
  const when = listing.publishedAt ?? listing.createdAt;

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
      <Link
        href="/ilanlar"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        ← İlanlara dön
      </Link>

      {listing.status !== "APPROVED" && (
        <div className="mb-4 rounded-lg border border-warning/30 bg-warning/10 px-4 py-2.5 text-sm text-warning">
          Bu ilan şu anda <strong>{LISTING_STATUS_LABELS[listing.status as keyof typeof LISTING_STATUS_LABELS]}</strong>{" "}
          durumunda. Yalnızca siz ve yöneticiler görebilir.
          {listing.rejectReason && (
            <span className="mt-1 block">Ret nedeni: {listing.rejectReason}</span>
          )}
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        {/* İçerik */}
        <div className="flex flex-col gap-5">
          <div className="rounded-[var(--radius-card)] border border-border bg-surface p-4 sm:p-6">
            <div className="flex items-center gap-2">
              <CategoryBadge
                name={listing.category.name}
                slug={listing.category.slug}
              />
              <Badge variant="neutral">Evlilik</Badge>
            </div>
            <h1 className="mt-3 text-2xl font-bold">{listing.title}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Cake className="size-4" /> {listing.age} yaş
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="size-4" /> {listing.city.name}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <User2 className="size-4" />{" "}
                {GENDER_LABELS[listing.gender as keyof typeof GENDER_LABELS]}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Search className="size-4" /> Aradığı:{" "}
                {GENDER_LABELS[listing.targetGender as keyof typeof GENDER_LABELS]}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="size-4" /> {timeAgo(when)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Eye className="size-4" /> {listing.viewCount} görüntülenme
              </span>
            </div>

            <p className="mt-5 whitespace-pre-line break-words leading-relaxed text-foreground/90">
              {listing.description}
            </p>
          </div>

          {/* Mesaj bölümü */}
          <div id="mesaj" className="rounded-[var(--radius-card)] border border-border bg-surface p-4 scroll-mt-20 sm:p-6">
            <h2 className="text-lg font-semibold">İletişime Geç</h2>
            {isOwner ? (
              <p className="mt-2 text-sm text-muted-foreground">
                Bu sizin ilanınız.
              </p>
            ) : !userId ? (
              <div className="mt-3 rounded-lg border border-border bg-surface-2 p-4 text-sm">
                Mesaj göndermek için{" "}
                <Link href="/giris" className="font-medium text-primary hover:underline">
                  giriş yapın
                </Link>{" "}
                veya{" "}
                <Link href="/kayit" className="font-medium text-primary hover:underline">
                  üye olun
                </Link>
                .
              </div>
            ) : profileIncomplete ? (
              <div className="mt-3 rounded-lg border border-warning/30 bg-warning/10 p-4 text-sm">
                Mesaj gönderebilmek için önce{" "}
                <Link
                  href="/hesabim/profil?eksik=1"
                  className="font-medium text-primary hover:underline"
                >
                  profil bilgilerinizi tamamlayın
                </Link>
                .
              </div>
            ) : (
              <div className="mt-3">
                <MessageCompose
                  recipientId={listing.author.id}
                  recipientName={authorName}
                />
              </div>
            )}
          </div>
        </div>

        {/* Yan panel: ilan sahibi */}
        <aside className="flex flex-col gap-4">
          <div className="rounded-[var(--radius-card)] border border-border bg-surface p-5">
            <div className="flex items-center gap-3">
              <Avatar className="h-14 w-14">
                {listing.author.profile?.avatarUrl && (
                  <AvatarImage
                    src={listing.author.profile.avatarUrl}
                    alt={authorName}
                  />
                )}
                <AvatarFallback>{initials(authorName)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{authorName}</p>
                <p className="text-xs text-muted-foreground">
                  Üye: {timeAgo(listing.author.createdAt)}
                </p>
              </div>
            </div>
            <Button asChild variant="outline" size="sm" className="mt-4 w-full">
              <Link href={`/uyeler/${listing.author.id}`}>Profili Gör</Link>
            </Button>
          </div>

          {!isOwner && (
            <div className="flex flex-col gap-2">
              {userId && (
                <FavoriteButton
                  listingId={listing.id}
                  isFavorited={isFavorited}
                />
              )}
              <ReportDialog targetType="LISTING" listingId={listing.id} />
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
