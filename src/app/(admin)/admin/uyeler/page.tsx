import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { AdminUserActions } from "@/components/admin/user-actions";
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

      <div className="overflow-x-auto rounded-[var(--radius-card)] border border-border">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="bg-surface-2 text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Üye</th>
              <th className="px-4 py-3">E-posta</th>
              <th className="px-4 py-3">Rol</th>
              <th className="px-4 py-3">Durum</th>
              <th className="px-4 py-3">İlan</th>
              <th className="px-4 py-3">Kayıt</th>
              <th className="px-4 py-3">İşlemler</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map((u) => (
              <tr key={u.id} className="bg-surface hover:bg-surface-2/50">
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/uyeler/${u.id}`}
                    className="font-medium hover:text-primary"
                  >
                    {u.profile?.displayName ?? "—"}
                  </Link>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                <td className="px-4 py-3">
                  <Badge variant={u.role === "ADMIN" ? "default" : "neutral"}>
                    {u.role === "ADMIN" ? "Admin" : "Üye"}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  {u.isBanned ? (
                    <Badge variant="destructive">Yasaklı</Badge>
                  ) : (
                    <Badge variant="success">Aktif</Badge>
                  )}
                </td>
                <td className="px-4 py-3">{u._count.listings}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {timeAgo(u.createdAt)}
                </td>
                <td className="px-4 py-3">
                  <AdminUserActions
                    id={u.id}
                    isBanned={u.isBanned}
                    role={u.role}
                    isSelf={u.id === meId}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
