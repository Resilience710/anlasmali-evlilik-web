import { prisma } from "@/lib/prisma";
import { ONLINE_THRESHOLD_MS } from "@/lib/constants";
import { isProfileComplete } from "@/lib/profile-completeness";

export async function getOnlineCount(): Promise<number> {
  const since = new Date(Date.now() - ONLINE_THRESHOLD_MS);
  return prisma.user.count({
    where: { lastSeenAt: { gte: since }, deletedAt: null, isBanned: false },
  });
}

export async function getSiteStats() {
  const since = new Date(Date.now() - ONLINE_THRESHOLD_MS);
  const [totalUsers, online, totalListings, setting] = await Promise.all([
    prisma.user.count({ where: { deletedAt: null } }),
    prisma.user.count({
      where: { lastSeenAt: { gte: since }, deletedAt: null, isBanned: false },
    }),
    prisma.listing.count({ where: { status: "APPROVED", deletedAt: null } }),
    prisma.siteSetting.findUnique({ where: { id: "singleton" } }),
  ]);

  return {
    totalUsers,
    online,
    totalListings,
    happyCount: setting?.happyCount ?? 0,
  };
}

export async function getAdminStats() {
  const since = new Date(Date.now() - ONLINE_THRESHOLD_MS);
  const [
    totalUsers,
    online,
    bannedUsers,
    totalListings,
    pendingListings,
    rejectedListings,
    totalMessages,
    openReports,
  ] = await Promise.all([
    prisma.user.count({ where: { deletedAt: null } }),
    prisma.user.count({
      where: { lastSeenAt: { gte: since }, deletedAt: null, isBanned: false },
    }),
    prisma.user.count({ where: { isBanned: true } }),
    prisma.listing.count({ where: { deletedAt: null } }),
    prisma.listing.count({ where: { status: "PENDING", deletedAt: null } }),
    prisma.listing.count({ where: { status: "REJECTED", deletedAt: null } }),
    prisma.message.count({ where: { deletedAt: null } }),
    prisma.report.count({ where: { status: "OPEN" } }),
  ]);

  return {
    totalUsers,
    online,
    bannedUsers,
    totalListings,
    pendingListings,
    rejectedListings,
    totalMessages,
    openReports,
  };
}

export type DailyStat = {
  label: string;
  users: number;
  listings: number;
  messages: number;
};

/** Son N günün günlük kayıt/ilan/mesaj sayıları (grafik için). */
export async function getDailyStats(days = 14): Promise<DailyStat[]> {
  const since = new Date();
  since.setHours(0, 0, 0, 0);
  since.setDate(since.getDate() - (days - 1));

  const [u, l, m] = await Promise.all([
    prisma.$queryRaw<{ d: Date; c: number }[]>`
      SELECT date_trunc('day', "createdAt") AS d, COUNT(*)::int AS c
      FROM "User" WHERE "createdAt" >= ${since} GROUP BY 1`,
    prisma.$queryRaw<{ d: Date; c: number }[]>`
      SELECT date_trunc('day', "createdAt") AS d, COUNT(*)::int AS c
      FROM "Listing" WHERE "createdAt" >= ${since} GROUP BY 1`,
    prisma.$queryRaw<{ d: Date; c: number }[]>`
      SELECT date_trunc('day', "createdAt") AS d, COUNT(*)::int AS c
      FROM "Message" WHERE "createdAt" >= ${since} GROUP BY 1`,
  ]);

  const key = (date: Date) => date.toISOString().slice(0, 10);
  const um = new Map(u.map((r) => [key(new Date(r.d)), Number(r.c)]));
  const lm = new Map(l.map((r) => [key(new Date(r.d)), Number(r.c)]));
  const mm = new Map(m.map((r) => [key(new Date(r.d)), Number(r.c)]));

  const out: DailyStat[] = [];
  for (let i = 0; i < days; i++) {
    const day = new Date(since);
    day.setDate(since.getDate() + i);
    const k = key(day);
    out.push({
      label: `${day.getDate()}.${day.getMonth() + 1}`,
      users: um.get(k) ?? 0,
      listings: lm.get(k) ?? 0,
      messages: mm.get(k) ?? 0,
    });
  }
  return out;
}

/** Dönüşüm hunisi: kayıt → profil tamamlama → ilan → mesaj. */
export async function getFunnel() {
  const [registered, profiles, listingAuthors, messageSenders] =
    await Promise.all([
      prisma.user.count({ where: { deletedAt: null } }),
      prisma.profile.findMany({
        select: {
          avatarUrl: true,
          displayName: true,
          username: true,
          phone: true,
          gender: true,
          age: true,
          cityId: true,
          lookingFor: true,
          bio: true,
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
      }),
      prisma.listing.findMany({
        where: { deletedAt: null },
        select: { authorId: true },
        distinct: ["authorId"],
      }),
      prisma.message.findMany({
        where: { deletedAt: null },
        select: { senderId: true },
        distinct: ["senderId"],
      }),
    ]);

  const profileComplete = profiles.filter((p) => isProfileComplete(p)).length;

  return {
    registered,
    profileComplete,
    withListing: listingAuthors.length,
    messaged: messageSenders.length,
  };
}
