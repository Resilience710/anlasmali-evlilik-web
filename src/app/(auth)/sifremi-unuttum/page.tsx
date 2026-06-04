import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ForgotForm } from "@/components/auth/forgot-form";

export const metadata: Metadata = { title: "Şifremi Unuttum" };

export default function ForgotPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Şifremi Unuttum</CardTitle>
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
