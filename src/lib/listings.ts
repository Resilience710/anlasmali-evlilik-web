import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

const listingCardSelect = {
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
} satisfies Prisma.ListingSelect;

export type ListingCard = Prisma.ListingGetPayload<{
  select: typeof listingCardSelect;
}>;

export async function getRecentListings(limit = 5): Promise<ListingCard[]> {
  return prisma.listing.findMany({
    where: { status: "APPROVED", deletedAt: null },
    orderBy: { publishedAt: "desc" },
    take: limit,
    select: listingCardSelect,
  });
}

export async function getCategorySidebar() {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
  });
  const counts = await Promise.all(
    categories.map((c) =>
      prisma.listing.count({
        where: { categoryId: c.id, status: "APPROVED", deletedAt: null },
      })
    )
  );
  const total = await prisma.listing.count({
    where: { status: "APPROVED", deletedAt: null },
  });
  return {
    total,
    categories: categories.map((c, i) => ({
      name: c.name,
      slug: c.slug,
      count: counts[i],
    })),
  };
}

export async function getCitySidebar(limit = 5) {
  const cities = await prisma.city.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
  });
  const counts = await Promise.all(
    cities.map((c) =>
      prisma.listing.count({
        where: { cityId: c.id, status: "APPROVED", deletedAt: null },
      })
    )
  );
  return cities
    .map((c, i) => ({ name: c.name, slug: c.slug, count: counts[i] }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export type ListingFilters = {
  kategori?: string; // category slug
  sehir?: string; // city slug
  cinsiyet?: string; // target gender MALE|FEMALE
  minAge?: number;
  maxAge?: number;
  q?: string;
  page?: number;
  perPage?: number;
};

export async function getListings(filters: ListingFilters) {
  const perPage = filters.perPage ?? 12;
  const page = Math.max(1, filters.page ?? 1);

  const where: Prisma.ListingWhereInput = {
    status: "APPROVED",
    deletedAt: null,
    ...(filters.kategori ? { category: { slug: filters.kategori } } : {}),
    ...(filters.sehir ? { city: { slug: filters.sehir } } : {}),
    ...(filters.cinsiyet ? { targetGender: filters.cinsiyet } : {}),
    ...(filters.minAge || filters.maxAge
      ? {
          age: {
            gte: filters.minAge ?? 18,
            lte: filters.maxAge ?? 99,
          },
        }
      : {}),
    ...(filters.q
      ? {
          OR: [
            { title: { contains: filters.q } },
            { description: { contains: filters.q } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.listing.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
      select: listingCardSelect,
    }),
    prisma.listing.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    perPage,
    totalPages: Math.max(1, Math.ceil(total / perPage)),
  };
}

export async function getListingBySlug(slug: string) {
  return prisma.listing.findFirst({
    where: { slug, deletedAt: null },
    include: {
      category: true,
      city: true,
      author: {
        select: {
          id: true,
          createdAt: true,
          profile: true,
        },
      },
    },
  });
}

export async function getCatalog() {
  const [categories, cities, ageOptions] = await Promise.all([
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
    }),
    prisma.city.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
    }),
    prisma.ageOption.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
    }),
  ]);
  return { categories, cities, ageOptions };
}
