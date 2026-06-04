"use client";

import { useActionState } from "react";
import Link from "next/link";
import { resetPasswordAction } from "@/app/_actions/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function ResetForm({ token }: { token: string }) {
  const action = resetPasswordAction.bind(null, token);
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state.error && (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      )}
      {state.success ? (
        <>
          <p className="rounded-lg border border-success/30 bg-success/10 px-3 py-2 text-sm text-success">
            {state.success}
          </p>
          <Button asChild size="lg">
            <Link href="/giris">Giriş Yap</Link>
          </Button>
        </>
      ) : (
        <>
          <div>
            <Label htmlFor="newPassword">Yeni Parola</Label>
            <Input id="newPassword" name="newPassword" type="password" className="mt-1.5" required />
          </div>
          <div>
            <Label htmlFor="confirmPassword">Yeni Parola (Tekrar)</Label>
            <Input id="confirmPassword" name="confirmPassword" type="password" className="mt-1.5" required />
          </div>
          <Button type="submit" size="lg" disabled={pending}>
            {pending ? "Güncelleniyor..." : "Parolayı Güncelle"}
          </Button>
        </>
      )}
    </form>
  );
}
