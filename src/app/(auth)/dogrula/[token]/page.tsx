import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "E-posta Doğrulama" };

export default async function VerifyPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const vt = await prisma.verificationToken.findUnique({ where: { token } });
  let ok = false;

  if (vt && vt.expires >= new Date()) {
    const user = await prisma.user.findUnique({
      where: { email: vt.identifier },
    });
    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() },
      });
      ok = true;
    }
    await prisma.verificationToken.delete({ where: { token } }).catch(() => {});
  }

  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
        {ok ? (
          <>
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-success/15 text-success">
              <CheckCircle2 className="size-8" />
            </span>
            <h1 className="text-xl font-bold">E-postanız doğrulandı 🎉</h1>
            <p className="text-sm text-muted-foreground">
              Artık giriş yapabilir ve hayat arkadaşınızı aramaya
              başlayabilirsiniz.
            </p>
            <Button asChild size="lg" className="mt-2 w-full">
              <Link href="/giris">Giriş Yap</Link>
            </Button>
          </>
        ) : (
          <>
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/15 text-destructive">
              <XCircle className="size-8" />
            </span>
            <h1 className="text-xl font-bold">Bağlantı geçersiz</h1>
            <p className="text-sm text-muted-foreground">
              Doğrulama bağlantısı geçersiz veya süresi dolmuş olabilir. Giriş
              sayfasından doğrulama e-postasını tekrar isteyebilirsiniz.
            </p>
            <Button asChild variant="outline" size="lg" className="mt-2 w-full">
              <Link href="/giris">Giriş Sayfası</Link>
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
