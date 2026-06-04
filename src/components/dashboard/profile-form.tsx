"use client";

import { useActionState } from "react";
import { updateProfileAction } from "@/app/_actions/profile";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "@/components/image-upload";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

type Defaults = {
  displayName?: string;
  bio?: string | null;
  gender?: string | null;
  age?: number | null;
  cityId?: string | null;
  lookingFor?: string | null;
  avatarUrl?: string | null;
};

export function ProfileForm({
  cities,
  defaults,
}: {
  cities: { id: string; name: string }[];
  defaults: Defaults;
}) {
  const [state, formAction, pending] = useActionState(updateProfileAction, {});
  const fe = state.fieldErrors ?? {};
  const ages = Array.from({ length: 82 }, (_, i) => 18 + i);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {state.success && (
        <p className="rounded-lg border border-success/30 bg-success/10 px-3 py-2 text-sm text-success">
          {state.success}
        </p>
      )}

      <div>
        <Label>Profil Fotoğrafı</Label>
        <div className="mt-1.5">
          <ImageUpload
            name="avatarUrl"
            defaultUrl={defaults.avatarUrl}
            fallbackText={defaults.displayName ?? ""}
            label="Fotoğraf"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="displayName">Ad Soyad / Takma Ad</Label>
        <Input
          id="displayName"
          name="displayName"
          defaultValue={defaults.displayName}
          className="mt-1.5"
          required
        />
        {fe.displayName?.[0] && (
          <p className="mt-1 text-xs text-destructive">{fe.displayName[0]}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <Label htmlFor="gender">Cinsiyet</Label>
          <Select name="gender" defaultValue={defaults.gender ?? undefined}>
            <SelectTrigger id="gender" className="mt-1.5">
              <SelectValue placeholder="Seçiniz" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="FEMALE">Kadın</SelectItem>
              <SelectItem value="MALE">Erkek</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="age">Yaş</Label>
          <Select name="age" defaultValue={defaults.age ? String(defaults.age) : undefined}>
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
        </div>
        <div>
          <Label htmlFor="lookingFor">Aradığınız Kişi</Label>
          <Select name="lookingFor" defaultValue={defaults.lookingFor ?? undefined}>
            <SelectTrigger id="lookingFor" className="mt-1.5">
              <SelectValue placeholder="Seçiniz" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="FEMALE">Kadın</SelectItem>
              <SelectItem value="MALE">Erkek</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="cityId">Şehir</Label>
        <Select name="cityId" defaultValue={defaults.cityId ?? undefined}>
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
      </div>

      <div>
        <Label htmlFor="bio">Hakkımda</Label>
        <Textarea
          id="bio"
          name="bio"
          defaultValue={defaults.bio ?? ""}
          rows={5}
          className="mt-1.5"
          placeholder="Kendinizden bahsedin..."
        />
        {fe.bio?.[0] && (
          <p className="mt-1 text-xs text-destructive">{fe.bio[0]}</p>
        )}
      </div>

      <Button type="submit" size="lg" disabled={pending} className="self-start">
        {pending ? "Kaydediliyor..." : "Profili Kaydet"}
      </Button>
    </form>
  );
}
