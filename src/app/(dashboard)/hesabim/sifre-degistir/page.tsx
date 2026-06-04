import type { Metadata } from "next";
import { ChangePasswordForm } from "@/components/dashboard/change-password-form";

export const metadata: Metadata = { title: "Şifre Değiştir" };

export default function ChangePasswordPage() {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-bold">Şifre Değiştir</h1>
        <p className="text-sm text-muted-foreground">
          Hesap güvenliğiniz için güçlü bir parola kullanın.
        </p>
      </div>
      <div className="rounded-[var(--radius-card)] border border-border bg-surface p-6">
        <ChangePasswordForm />
      </div>
    </div>
  );
}
