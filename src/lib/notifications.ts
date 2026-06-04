import { prisma } from "@/lib/prisma";

export async function getUnreadNotificationCount(
  userId: string
): Promise<number> {
  return prisma.notification.count({ where: { userId, isRead: false } });
}

export async function getUserNotifications(userId: string) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}

export async function createNotification(data: {
  userId: string;
  type: string;
  title: string;
  body?: string;
  linkUrl?: string;
}) {
  return prisma.notification.create({ data });
}
