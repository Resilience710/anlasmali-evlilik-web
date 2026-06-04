"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { ArrowRight, ArrowLeft } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { createListingAction } from "@/app/_actions/listings";
import { cn } from "@/lib/utils";

type Option = { id: string; name: string };

export function InlineListingWizard({
  categories,
  cities,
  isLoggedIn,
}: {
  categories: Option[];
  cities: Option[];
  isLoggedIn: boolean;
}) {
  const [state, formAction, pending] = useActionState(createListingAction, {});
  const [step, setStep] = useState(1);
  const [targetGender, setTargetGender] = useState("");

  const ownerGender = targetGender === "MALE" ? "FEMALE" : "MALE";
  const ages = Array.from({ length: 63 }, (_, i) => 18 + i); // 18-80

  const err = (f: string) => state.fieldErrors?.[f]?.[0];

  return (
    <div className="rounded-[var(--radius-card)] border border-border bg-surface p-4">
      <h2 className="px-1 text-base font-semibold">İlan Oluştur</h2>
      <p className="mb-3 px-1 text-xs text-muted-foreground">
        Yeni ilan vererek aradığınız kişiye ulaşın.
      </p>

      {/* Stepper */}
      <div className="mb-4 flex items-center px-1">
        {[1, 2, 3].map((n, i) => (
          <div key={n} className="flex flex-1 items-center last:flex-none">
            <span
              className={cn(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                step >= n
                  ? "bg-primary text-primary-foreground"
                  : "bg-elevated text-muted-foreground"
              )}
            >
              {n}
            </span>
            {i < 2 && (
              <span
                className={cn(
                  "mx-1.5 h-0.5 flex-1 rounded-full",
                  step > n ? "bg-primary" : "bg-border"
                )}
              />
            )}
          </div>
        ))}
      </div>

      <form action={formAction} className="flex flex-col gap-3">
        {/* gizli türetilmiş alanlar */}
        <input type="hidden" name="gender" value={ownerGender} />

        {/* STEP 1 */}
        <div className={cn("flex-col gap-3", step === 1 ? "flex" : "hidden")}>
          <div>
            <Label htmlFor="w-cat">Kategori</Label>
            <Select name="categoryId">
              <SelectTrigger id="w-cat" className="mt-1.5">
                <SelectValue placeholder="Seçiniz" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="w-title">İlan Başlığı</Label>
            <Input
              id="w-title"
              name="title"
              placeholder="İlan başlığını yazın"
              className="mt-1.5"
            />
            {err("title") && (
              <p className="mt-1 text-xs text-destructive">{err("title")}</p>
            )}
          </div>
        </div>

        {/* STEP 2 */}
        <div className={cn("flex-col gap-3", step === 2 ? "flex" : "hidden")}>
          <div>
            <Label htmlFor="w-desc">Kendinizden Bahsedin</Label>
            <Textarea
              id="w-desc"
              name="description"
              placeholder="Kendiniz hakkında kısa bilgi verin..."
              className="mt-1.5"
            />
            {err("description") && (
              <p className="mt-1 text-xs text-destructive">
                {err("description")}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="w-age">Yaş</Label>
            <Select name="age">
              <SelectTrigger id="w-age" className="mt-1.5">
                <SelectValue placeholder="Seçiniz" />
              </SelectTrigger>
              <SelectContent>
                {ages.map((a) => (
                  <SelectItem key={a} value={String(a)}>
                    {a}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* STEP 3 */}
        <div className={cn("flex-col gap-3", step === 3 ? "flex" : "hidden")}>
          <div>
            <Label htmlFor="w-city">Şehir</Label>
            <Select name="cityId">
              <SelectTrigger id="w-city" className="mt-1.5">
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
          </div>
          <div>
            <Label htmlFor="w-target">Aradığınız Kişi</Label>
            <Select
              name="targetGender"
              value={targetGender}
              onValueChange={setTargetGender}
            >
              <SelectTrigger id="w-target" className="mt-1.5">
                <SelectValue placeholder="Seçiniz" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="FEMALE">Kadın</SelectItem>
                <SelectItem value="MALE">Erkek</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {state.error && (
          <p className="text-xs text-destructive">{state.error}</p>
        )}

        {/* Navigasyon */}
        <div className="mt-1 flex items-center gap-2">
          {step > 1 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setStep((s) => s - 1)}
            >
              <ArrowLeft />
              Geri
            </Button>
          )}
          {step < 3 ? (
            <Button
              type="button"
              className="flex-1"
              onClick={() => setStep((s) => s + 1)}
            >
              Devam Et
              <ArrowRight />
            </Button>
          ) : isLoggedIn ? (
            <Button type="submit" className="flex-1" disabled={pending}>
              {pending ? "Gönderiliyor..." : "İlanı Yayınla"}
            </Button>
          ) : (
            <Button asChild className="flex-1">
              <Link href="/kayit">Üye Ol ve İlan Ver</Link>
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
