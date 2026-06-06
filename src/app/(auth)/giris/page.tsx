import type { Metadata } from "next";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = { title: "Giriş Yap" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const sp = await searchParams;
  return (
    <Card>
      <CardHeader>
        <h1 className="text-2xl font-bold tracking-tight">Giriş Yap</h1>
        <p className="text-sm text-muted-foreground">
          Hesabınıza giriş yaparak devam edin.
        </p>
      </CardHeader>
      <CardContent>
        <LoginForm callbackUrl={sp.callbackUrl} />
      </CardContent>
    </Card>
  );
}
