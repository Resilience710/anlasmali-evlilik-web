import type { Metadata } from "next";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AdminUsersTable, type AdminUserRow } from "@/components/admin/users-table";
import { timeAgo } from "@/lib/utils";

export const metadata: Metadata = { title: "Üyeler — Yönetim" };

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const sp = await searchParams;
  const session = await auth();
  const meId = session?.user?.id;
  const viewerRole = session?.user?.role;

  const users = await prisma.user.findMany({
    where: {
      deletedAt: null,
      ...(sp.q
        ? {
            OR: [
              { email: { contains: sp.q } },
              { profile: { displayName: { contains: sp.q } } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      email: true,
      role: true,
      isBanned: true,
      createdAt: true,
      profile: { select: { displayName: true } },
      _count: { select: { listings: true } },
    },
  });

  const rows: AdminUserRow[] = users.map((u) => ({
    id: u.id,
    displayName: u.profile?.displayName ?? "—",
    email: u.email,
    role: u.role,
    isBanned: u.isBanned,
    listings: u._count.listings,
    registered: timeAgo(u.createdAt),
  }));

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Üyeler</h1>
        <form className="flex w-full gap-2 sm:w-auto">
          <input
            name="q"
            defaultValue={sp.q}
            placeholder="E-posta veya isim ara"
            className="h-10 flex-1 rounded-lg border border-border bg-surface-2 px-3 text-base focus-visible:border-primary focus-visible:outline-none sm:h-9 sm:w-56 sm:flex-none sm:text-sm"
          />
          <button className="shrink-0 rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground cursor-pointer">
            Ara
          </button>
        </form>
      </div>

      <AdminUsersTable rows={rows} meId={meId} viewerRole={viewerRole} />
    </div>
  );
}
