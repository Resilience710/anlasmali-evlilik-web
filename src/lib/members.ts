import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { ONLINE_THRESHOLD_MS } from "@/lib/constants";

export type MemberFilters = {
  sehir?: string; // city slug
  cinsiyet?: string; // MALE | FEMALE
  page?: number;
  perPage?: number;
};

export async function getMembers(filters: MemberFilters) {
  const perPage = filters.perPage ?? 12;
  const page = Math.max(1, filters.page ?? 1);

  const where: Prisma.UserWhereInput = {
    role: "USER",
    deletedAt: null,
    isBanned: false,
    profile: {
      is: {
        ...(filters.cinsiyet ? { gender: filters.cinsiyet } : {}),
        ...(filters.sehir ? { city: { slug: filters.sehir } } : {}),
      },
    },
  };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
      select: {
        id: true,
        lastSeenAt: true,
        profile: {
          select: {
            displayName: true,
            avatarUrl: true,
            gender: true,
            age: true,
            bio: true,
            city: { select: { name: true } },
          },
        },
        _count: {
          select: {
            listings: { where: { status: "APPROVED", deletedAt: null } },
          },
        },
      },
    }),
    prisma.user.count({ where }),
  ]);

  const since = Date.now() - ONLINE_THRESHOLD_MS;
  return {
    items: users.map((u) => ({
      id: u.id,
      online: u.lastSeenAt ? u.lastSeenAt.getTime() >= since : false,
      displayName: u.profile?.displayName ?? "Üye",
      avatarUrl: u.profile?.avatarUrl ?? null,
      gender: u.profile?.gender ?? null,
      age: u.profile?.age ?? null,
      bio: u.profile?.bio ?? null,
      city: u.profile?.city?.name ?? null,
      listingCount: u._count.listings,
    })),
    total,
    page,
    perPage,
    totalPages: Math.max(1, Math.ceil(total / perPage)),
  };
}

export async function getMemberProfile(id: string) {
  const user = await prisma.user.findFirst({
    where: { id, deletedAt: null, isBanned: false },
    select: {
      id: true,
      createdAt: true,
      lastSeenAt: true,
      profile: {
        select: {
          displayName: true,
          avatarUrl: true,
          gender: true,
          age: true,
          bio: true,
          lookingFor: true,
          city: { select: { name: true } },
        },
      },
    },
  });
  if (!user) return null;

  const listings = await prisma.listing.findMany({
    where: { authorId: id, status: "APPROVED", deletedAt: null },
    orderBy: { publishedAt: "desc" },
    take: 12,
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
  });

  return { user, listings };
}
