"use client";

import { useActionState } from "react";
import { changePasswordAction } from "@/app/_actions/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function ChangePasswordForm() {
  const [state, formAction, pending] = useActionState(changePasswordAction, {});
  const fe = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="flex max-w-md flex-col gap-4">
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
        <Label htmlFor="currentPassword">Mevcut Parola</Label>
        <Input id="currentPassword" name="currentPassword" type="password" className="mt-1.5" required />
      </div>
      <div>
        <Label htmlFor="newPassword">Yeni Parola</Label>
        <Input id="newPassword" name="newPassword" type="password" className="mt-1.5" required />
        {fe.newPassword?.[0] && (
          <p className="mt-1 text-xs text-destructive">{fe.newPassword[0]}</p>
        )}
      </div>
      <div>
        <Label htmlFor="confirmPassword">Yeni Parola (Tekrar)</Label>
        <Input id="confirmPassword" name="confirmPassword" type="password" className="mt-1.5" required />
        {fe.confirmPassword?.[0] && (
          <p className="mt-1 text-xs text-destructive">{fe.confirmPassword[0]}</p>
        )}
      </div>
      <Button type="submit" disabled={pending} className="self-start">
        {pending ? "Güncelleniyor..." : "Parolayı Güncelle"}
      </Button>
    </form>
  );
}
