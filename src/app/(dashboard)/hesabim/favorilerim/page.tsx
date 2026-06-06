import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { ListingCard } from "@/components/listings/listing-card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Favorilerim" };

export default async function FavoritesPage() {
  const user = await requireUser();
  const favorites = await prisma.favorite.findMany({
    where: { userId: user.id, listing: { deletedAt: null, status: "APPROVED" } },
    orderBy: { createdAt: "desc" },
    include: {
      listing: {
        select: {
          id: true,
          title: true,
          slug: true,
          age: true,
          gender: true,
          targetGender: true,
          imageUrl: true,
          viewCount: true,
          publishedAt: true,
          createdAt: true,
          category: { select: { name: true, slug: true } },
          city: { select: { name: true, slug: true } },
          author: {
            select: {
              id: true,
              profile: { select: { displayName: true, avatarUrl: true } },
            },
          },
        },
      },
    },
  });

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-bold">Favorilerim</h1>
        <p className="text-sm text-muted-foreground">{favorites.length} ilan</p>
      </div>

      {favorites.length === 0 ? (
        <div className="rounded-[var(--radius-card)] border border-border bg-surface p-6 text-center sm:p-10">
          <p className="text-muted-foreground">Henüz favori ilanınız yok.</p>
          <Button asChild className="mt-4">
            <Link href="/ilanlar">İlanlara Göz At</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {favorites.map((f) => (
            <ListingCard key={f.id} listing={f.listing} />
          ))}
        </div>
      )}
    </div>
  );
}
