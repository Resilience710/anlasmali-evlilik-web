import type { Metadata } from "next";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ForgotForm } from "@/components/auth/forgot-form";

export const metadata: Metadata = { title: "Şifremi Unuttum" };

export default function ForgotPage() {
  return (
    <Card>
      <CardHeader>
        <h1 className="text-2xl font-bold tracking-tight">Şifremi Unuttum</h1>
        <p className="text-sm text-muted-foreground">
          E-posta adresinizi girin, sıfırlama bağlantısı gönderelim.
        </p>
      </CardHeader>
      <CardContent>
        <ForgotForm />
      </CardContent>
    </Card>
  );
}
