import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { AdminUserActions } from "@/components/admin/user-actions";
import { GENDER_LABELS, type Gender, LISTING_STATUS_LABELS, type ListingStatus, ROLE_LABELS, type Role } from "@/lib/constants";
import { initials, timeAgo } from "@/lib/utils";

export const metadata: Metadata = { title: "Üye Detayı — Yönetim" };

export default async function AdminUserDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      profile: { include: { city: true } },
      listings: { orderBy: { createdAt: "desc" }, include: { category: true } },
    },
  });
  if (!user) notFound();

  const name = user.profile?.displayName ?? "—";

  return (
    <div className="flex flex-col gap-5">
      <Link href="/admin/uyeler" className="text-sm text-muted-foreground hover:text-foreground">
        ← Üyeler
      </Link>

      <div className="rounded-[var(--radius-card)] border border-border bg-surface p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              {user.profile?.avatarUrl && (
                <AvatarImage src={user.profile.avatarUrl} alt={name} />
              )}
              <AvatarFallback>{initials(name)}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-xl font-bold">{name}</h1>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge variant={user.role === "USER" ? "neutral" : "default"}>
                  {ROLE_LABELS[user.role as Role] ?? user.role}
                </Badge>
                {user.isBanned && <Badge variant="destructive">Yasaklı</Badge>}
                {user.profile?.gender && (
                  <Badge variant="neutral">
                    {GENDER_LABELS[user.profile.gender as Gender]}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <AdminUserActions
            id={user.id}
            isBanned={user.isBanned}
            role={user.role}
            isSelf={user.id === session?.user?.id}
            viewerRole={session?.user?.role}
          />
        </div>

        <dl className="mt-5 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          <div>
            <dt className="text-muted-foreground">Yaş</dt>
            <dd>{user.profile?.age ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Şehir</dt>
            <dd>{user.profile?.city?.name ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Kayıt</dt>
            <dd>{user.createdAt.toLocaleDateString("tr-TR")}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Son görülme</dt>
            <dd>{user.lastSeenAt ? timeAgo(user.lastSeenAt) : "—"}</dd>
          </div>
        </dl>
        {user.profile?.bio && (
          <p className="mt-4 text-sm text-foreground/90">{user.profile.bio}</p>
        )}
      </div>

      <div className="rounded-[var(--radius-card)] border border-border bg-surface p-5">
        <h2 className="mb-3 font-semibold">İlanları ({user.listings.length})</h2>
        {user.listings.length === 0 ? (
          <p className="text-sm text-muted-foreground">İlan yok.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {user.listings.map((l) => (
              <li
                key={l.id}
                className="flex items-center justify-between gap-2 rounded-lg bg-surface-2 p-2.5 text-sm"
              >
                <span className="min-w-0 truncate">{l.title}</span>
                <Badge variant="neutral">
                  {LISTING_STATUS_LABELS[l.status as ListingStatus]}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
