import type { Metadata } from "next";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { signOutAction } from "@/app/_actions/auth";
import { Button } from "@/components/ui/button";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Hesap Askıya Alındı",
  description: "Hesap askıya alma bilgilendirme sayfası.",
  path: "/hesap-askida",
  noIndex: true,
});

export default async function AccountSuspendedPage() {
  const session = await auth();
  let banReason: string | null = null;
  let banExpiresAt: Date | null = null;
  if (session?.user?.id) {
    const u = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { banReason: true, banExpiresAt: true },
    });
    banReason = u?.banReason ?? null;
    banExpiresAt = u?.banExpiresAt ?? null;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-gradient-to-b from-background to-surface-2 px-4 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/15 text-destructive">
        <ShieldAlert className="size-8" />
      </span>
      <div className="max-w-md">
        <h1 className="text-2xl font-bold">Hesabınız askıya alındı</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Hesabınız kurallarımıza aykırı bir durum nedeniyle yönetici tarafından
          askıya alınmıştır. Bu süreçte ilan oluşturamaz, mesaj gönderemez veya
          içerikleri görüntüleyemezsiniz. Bunun bir hata olduğunu düşünüyorsanız
          bizimle iletişime geçebilirsiniz.
        </p>
        {(banReason || banExpiresAt) && (
          <div className="mt-4 rounded-lg border border-border bg-surface p-3 text-left text-sm">
            {banReason && (
              <p>
                <span className="text-muted-foreground">Sebep: </span>
                {banReason}
              </p>
            )}
            {banExpiresAt && (
              <p className="mt-1">
                <span className="text-muted-foreground">Bitiş: </span>
                {banExpiresAt.toLocaleDateString("tr-TR", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            )}
          </div>
        )}
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button asChild variant="outline">
          <Link href="/iletisim">İletişime Geç</Link>
        </Button>
        <form action={signOutAction}>
          <Button type="submit" variant="ghost">
            Çıkış Yap
          </Button>
        </form>
      </div>
    </div>
  );
}
