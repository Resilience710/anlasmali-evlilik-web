import type { Metadata } from "next";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { signOutAction } from "@/app/_actions/auth";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Hesap Askıya Alındı" };

export default function AccountSuspendedPage() {
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
