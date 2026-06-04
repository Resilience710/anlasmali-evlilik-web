import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Hesap Ayarlarım" };

export default async function SettingsPage() {
  const user = await requireUser();
  const account = await prisma.user.findUnique({
    where: { id: user.id },
    select: { email: true, createdAt: true, role: true },
  });

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-2xl font-bold">Hesap Ayarlarım</h1>

      <div className="rounded-[var(--radius-card)] border border-border bg-surface p-6">
        <h2 className="font-semibold">Hesap Bilgileri</h2>
        <dl className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted-foreground">E-posta</dt>
            <dd className="font-medium">{account?.email}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Üyelik Tarihi</dt>
            <dd className="font-medium">
              {account?.createdAt.toLocaleDateString("tr-TR")}
            </dd>
          </div>
        </dl>
        <div className="mt-4 flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/hesabim/profil">Profili Düzenle</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/hesabim/sifre-degistir">Şifre Değiştir</Link>
          </Button>
        </div>
      </div>

      <div className="rounded-[var(--radius-card)] border border-destructive/30 bg-destructive/5 p-6">
        <h2 className="font-semibold text-destructive">Tehlikeli Bölge</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Hesabınızı silmek için bizimle iletişime geçin. Hesabınız silindiğinde
          ilanlarınız ve mesajlarınız kaldırılır.
        </p>
        <Button asChild variant="outline" size="sm" className="mt-3">
          <Link href="/iletisim">İletişime Geç</Link>
        </Button>
      </div>
    </div>
  );
}
