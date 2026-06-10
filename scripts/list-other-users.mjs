import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const others = await prisma.user.findMany({
  where: { email: { not: { endsWith: "@ornek.com" } } },
  select: {
    id: true,
    email: true,
    role: true,
    createdAt: true,
    profile: { select: { displayName: true } },
    _count: { select: { listings: true, sentMessages: true } },
  },
  orderBy: { createdAt: "asc" },
});
others.forEach((u) => {
  console.log(
    `${u.role.padEnd(10)} ${u.email.padEnd(45)} "${u.profile?.displayName ?? "—"}"  ${u._count.listings} ilan, ${u._count.sentMessages} mesaj  (${u.createdAt.toISOString().slice(0,10)})`
  );
});
await prisma.$disconnect();
