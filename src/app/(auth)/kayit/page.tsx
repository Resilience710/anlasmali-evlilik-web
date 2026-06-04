import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = { title: "Üye Ol" };

export default function RegisterPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Üye Ol</CardTitle>
        <p className="text-sm text-muted-foreground">
          Ücretsiz üye olun, hayat arkadaşınızı bulun.
        </p>
      </CardHeader>
      <CardContent>
        <RegisterForm />
      </CardContent>
    </Card>
  );
}
