import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RegisterForm } from "@/components/auth/register-form";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Üye Ol" };

export default async function RegisterPage() {
  const cities = await prisma.city.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
    select: { id: true, name: true },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Üye Ol</CardTitle>
        <p className="text-sm text-muted-foreground">
          Ücretsiz üye olun, hayat arkadaşınızı bulun.
        </p>
      </CardHeader>
      <CardContent>
        <RegisterForm cities={cities} />
      </CardContent>
    </Card>
  );
}
