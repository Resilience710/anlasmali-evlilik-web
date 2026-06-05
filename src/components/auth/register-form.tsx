"use client";

import { useActionState } from "react";
import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { registerAction } from "@/app/_actions/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="mt-1 text-xs text-destructive">{msg}</p>;
}

export function RegisterForm({
  cities,
}: {
  cities: { id: string; name: string }[];
}) {
  const [state, formAction, pending] = useActionState(registerAction, {});
  const fe = state.fieldErrors ?? {};
  const v = state.values ?? {};

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state.error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          <AlertCircle className="size-4 shrink-0" />
          {state.error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="displayName">Ad Soyad</Label>
          <Input
            id="displayName"
            name="displayName"
            defaultValue={v.displayName}
            placeholder="Örn: Ahmet Yılmaz"
            className="mt-1.5"
            required
          />
          <FieldError msg={fe.displayName?.[0]} />
        </div>
        <div>
          <Label htmlFor="username">Takma Ad</Label>
          <Input
            id="username"
            name="username"
            defaultValue={v.username}
            placeholder="Örn: ahmet_y"
            className="mt-1.5"
            required
          />
          <FieldError msg={fe.username?.[0]} />
        </div>
      </div>

      <div>
        <Label htmlFor="email">E-posta</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          defaultValue={v.email}
          className="mt-1.5"
          required
        />
        <FieldError msg={fe.email?.[0]} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="phone">Telefon</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            defaultValue={v.phone}
            placeholder="05XX XXX XX XX"
            className="mt-1.5"
            required
          />
          <FieldError msg={fe.phone?.[0]} />
        </div>
        <div>
          <Label htmlFor="cityId">Şehir</Label>
          <Select name="cityId" defaultValue={v.cityId || undefined}>
            <SelectTrigger id="cityId" className="mt-1.5">
              <SelectValue placeholder="Seçiniz" />
            </SelectTrigger>
            <SelectContent>
              {cities.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError msg={fe.cityId?.[0]} />
        </div>
      </div>

      <div>
        <Label htmlFor="gender">Cinsiyet</Label>
        <Select name="gender" defaultValue={v.gender || undefined}>
          <SelectTrigger id="gender" className="mt-1.5">
            <SelectValue placeholder="Seçiniz" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="FEMALE">Kadın</SelectItem>
            <SelectItem value="MALE">Erkek</SelectItem>
          </SelectContent>
        </Select>
        <FieldError msg={fe.gender?.[0]} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="password">Parola</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            className="mt-1.5"
            required
          />
          <FieldError msg={fe.password?.[0]} />
        </div>
        <div>
          <Label htmlFor="confirmPassword">Parola (Tekrar)</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            className="mt-1.5"
            required
          />
          <FieldError msg={fe.confirmPassword?.[0]} />
        </div>
      </div>

      <label className="flex items-start gap-2 text-sm text-muted-foreground">
        <input
          type="checkbox"
          name="acceptTerms"
          defaultChecked={v.acceptTerms === "on"}
          className="mt-0.5 h-4 w-4 accent-[var(--color-primary)]"
        />
        <span>
          <Link href="/kullanim-sartlari" className="text-primary hover:underline">
            Kullanım Şartları
          </Link>
          ’nı okudum ve kabul ediyorum.
        </span>
      </label>
      <FieldError msg={fe.acceptTerms?.[0]} />

      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "Kayıt oluşturuluyor..." : "Üye Ol"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Zaten üye misiniz?{" "}
        <Link href="/giris" className="font-medium text-primary hover:underline">
          Giriş Yap
        </Link>
      </p>
    </form>
  );
}
