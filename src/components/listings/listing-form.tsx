"use client";

import { useActionState } from "react";
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
import { ImageUpload } from "@/components/image-upload";
import type { ListingActionState } from "@/app/_actions/listings";

type Opt = { id: string; name: string };
type Defaults = {
  title?: string;
  description?: string;
  categoryId?: string;
  cityId?: string;
  age?: number;
  gender?: string;
  targetGender?: string;
  imageUrl?: string | null;
};

export function ListingForm({
  action,
  categories,
  cities,
  defaults,
  submitLabel = "İlanı Yayınla",
}: {
  action: (
    prev: ListingActionState,
    formData: FormData
  ) => Promise<ListingActionState>;
  categories: Opt[];
  cities: Opt[];
  defaults?: Defaults;
  submitLabel?: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const fe = state.fieldErrors ?? {};
  const ages = Array.from({ length: 63 }, (_, i) => 18 + i);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {state.error && (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      )}

      <div>
        <Label htmlFor="title">İlan Başlığı</Label>
        <Input
          id="title"
          name="title"
          defaultValue={defaults?.title}
          placeholder="Örn: Ciddi evlilik düşünen hayat arkadaşı arıyorum"
          className="mt-1.5"
          required
        />
        {fe.title?.[0] && (
          <p className="mt-1 text-xs text-destructive">{fe.title[0]}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="categoryId">Kategori</Label>
          <Select name="categoryId" defaultValue={defaults?.categoryId}>
            <SelectTrigger id="categoryId" className="mt-1.5">
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
          {fe.categoryId?.[0] && (
            <p className="mt-1 text-xs text-destructive">{fe.categoryId[0]}</p>
          )}
        </div>
        <div>
          <Label htmlFor="cityId">Şehir</Label>
          <Select name="cityId" defaultValue={defaults?.cityId}>
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
          {fe.cityId?.[0] && (
            <p className="mt-1 text-xs text-destructive">{fe.cityId[0]}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <Label htmlFor="age">Yaşınız</Label>
          <Select name="age" defaultValue={defaults?.age ? String(defaults.age) : undefined}>
            <SelectTrigger id="age" className="mt-1.5">
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
          {fe.age?.[0] && (
            <p className="mt-1 text-xs text-destructive">{fe.age[0]}</p>
          )}
        </div>
        <div>
          <Label htmlFor="gender">Cinsiyetiniz</Label>
          <Select name="gender" defaultValue={defaults?.gender}>
            <SelectTrigger id="gender" className="mt-1.5">
              <SelectValue placeholder="Seçiniz" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="FEMALE">Kadın</SelectItem>
              <SelectItem value="MALE">Erkek</SelectItem>
            </SelectContent>
          </Select>
          {fe.gender?.[0] && (
            <p className="mt-1 text-xs text-destructive">{fe.gender[0]}</p>
          )}
        </div>
        <div>
          <Label htmlFor="targetGender">Aradığınız Kişi</Label>
          <Select name="targetGender" defaultValue={defaults?.targetGender}>
            <SelectTrigger id="targetGender" className="mt-1.5">
              <SelectValue placeholder="Seçiniz" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="FEMALE">Kadın</SelectItem>
              <SelectItem value="MALE">Erkek</SelectItem>
            </SelectContent>
          </Select>
          {fe.targetGender?.[0] && (
            <p className="mt-1 text-xs text-destructive">{fe.targetGender[0]}</p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="description">Kendinizden Bahsedin</Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={defaults?.description}
          rows={6}
          placeholder="Kendiniz, beklentileriniz ve aradığınız kişi hakkında bilgi verin..."
          className="mt-1.5"
          required
        />
        {fe.description?.[0] && (
          <p className="mt-1 text-xs text-destructive">{fe.description[0]}</p>
        )}
      </div>

      <div>
        <Label>İlan Fotoğrafı (opsiyonel)</Label>
        <div className="mt-1.5">
          <ImageUpload
            name="imageUrl"
            defaultUrl={defaults?.imageUrl}
            label="Fotoğraf"
            rounded="lg"
          />
        </div>
      </div>

      <div className="rounded-lg border border-border bg-surface-2 px-4 py-3 text-xs text-muted-foreground">
        İlanınız, güvenlik için yönetici onayından sonra yayınlanır.
      </div>

      <Button type="submit" size="lg" disabled={pending} className="self-start">
        {pending ? "Kaydediliyor..." : submitLabel}
      </Button>
    </form>
  );
}
