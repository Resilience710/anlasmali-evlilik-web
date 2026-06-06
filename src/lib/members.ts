import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { ONLINE_THRESHOLD_MS } from "@/lib/constants";
import { clamp } from "@/lib/utils";

export type MemberFilters = {
  sehir?: string; // city slug
  cinsiyet?: string; // MALE | FEMALE
  medeni?: string; // medeni hal
  vucut?: string; // vücut tipi
  sigara?: string; // sigara
  minAge?: number;
  maxAge?: number;
  page?: number;
  perPage?: number;
};

export async function getMembers(filters: MemberFilters) {
  const perPage = clamp(filters.perPage ?? 12, 1, 48);
  const page = clamp(filters.page ?? 1, 1, 10000);

  const profileWhere: Prisma.ProfileWhereInput = {
    ...(filters.cinsiyet ? { gender: filters.cinsiyet } : {}),
    ...(filters.sehir ? { city: { slug: filters.sehir } } : {}),
    ...(filters.medeni ? { maritalStatus: filters.medeni } : {}),
    ...(filters.vucut ? { bodyType: filters.vucut } : {}),
    ...(filters.sigara ? { smoking: filters.sigara } : {}),
    ...(filters.minAge || filters.maxAge
      ? { age: { gte: filters.minAge ?? 18, lte: filters.maxAge ?? 99 } }
      : {}),
  };

  const where: Prisma.UserWhereInput = {
    role: "USER",
    deletedAt: null,
    isBanned: false,
    profile: { is: profileWhere },
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
        emailVerified: true,
        profile: {
          select: {
            displayName: true,
            avatarUrl: true,
            gender: true,
            age: true,
            bio: true,
            city: { select: { name: true } },
            maritalStatus: true,
            bodyType: true,
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
      verified: !!u.emailVerified,
      displayName: u.profile?.displayName ?? "Üye",
      avatarUrl: u.profile?.avatarUrl ?? null,
      gender: u.profile?.gender ?? null,
      age: u.profile?.age ?? null,
      bio: u.profile?.bio ?? null,
      city: u.profile?.city?.name ?? null,
      maritalStatus: u.profile?.maritalStatus ?? null,
      bodyType: u.profile?.bodyType ?? null,
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
      emailVerified: true,
      profile: {
        select: {
          displayName: true,
          username: true,
          avatarUrl: true,
          gender: true,
          age: true,
          bio: true,
          lookingFor: true,
          city: { select: { name: true } },
          profession: true,
          jobTitle: true,
          education: true,
          maritalStatus: true,
          bodyType: true,
          zodiac: true,
          height: true,
          weight: true,
          smoking: true,
          alcohol: true,
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
