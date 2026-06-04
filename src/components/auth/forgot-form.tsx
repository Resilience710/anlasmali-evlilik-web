"use client";

import { useActionState } from "react";
import Link from "next/link";
import { forgotPasswordAction } from "@/app/_actions/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function ForgotForm() {
  const [state, formAction, pending] = useActionState(forgotPasswordAction, {});

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state.error && (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="rounded-lg border border-success/30 bg-success/10 px-3 py-2 text-sm text-success">
          {state.success}
        </p>
      )}
      <div>
        <Label htmlFor="email">E-posta</Label>
        <Input id="email" name="email" type="email" className="mt-1.5" required />
      </div>
      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "Gönderiliyor..." : "Sıfırlama Bağlantısı Gönder"}
      </Button>
      <p className="text-center text-sm">
        <Link href="/giris" className="text-primary hover:underline">
          Girişe dön
        </Link>
      </p>
    </form>
  );
}
