"use client";

import { useActionState } from "react";
import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { loginAction } from "@/app/_actions/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function LoginForm({ callbackUrl }: { callbackUrl?: string }) {
  const [state, formAction, pending] = useActionState(loginAction, {});

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="callbackUrl" value={callbackUrl ?? "/hesabim"} />

      {state.error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          <AlertCircle className="size-4 shrink-0" />
          {state.error}
        </div>
      )}

      <div>
        <Label htmlFor="email">E-posta</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="ornek@email.com"
          className="mt-1.5"
          required
        />
      </div>
      <div>
        <Label htmlFor="password">Parola</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          className="mt-1.5"
          required
        />
      </div>

      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "Giriş yapılıyor..." : "Giriş Yap"}
      </Button>

      <div className="flex items-center justify-between text-sm">
        <Link href="/sifremi-unuttum" className="text-muted-foreground hover:text-foreground">
          Şifremi unuttum
        </Link>
        <Link href="/kayit" className="font-medium text-primary hover:underline">
          Üye Ol
        </Link>
      </div>
    </form>
  );
}
