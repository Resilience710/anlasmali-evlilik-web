import { prisma } from "@/lib/prisma";
import { ONLINE_THRESHOLD_MS } from "@/lib/constants";

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
