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
import {
  MARITAL_STATUSES,
  BODY_TYPES,
  EDUCATION_LEVELS,
  SMOKING_OPTIONS,
  ALCOHOL_OPTIONS,
  ZODIAC_SIGNS,
} from "@/lib/constants";

type Defaults = {
  displayName?: string;
  bio?: string | null;
  gender?: string | null;
  age?: number | null;
  cityId?: string | null;
  lookingFor?: string | null;
  avatarUrl?: string | null;
  username?: string | null;
  phone?: string | null;
  profession?: string | null;
  jobTitle?: string | null;
  education?: string | null;
  maritalStatus?: string | null;
  bodyType?: string | null;
  zodiac?: string | null;
  height?: number | null;
  weight?: number | null;
  smoking?: string | null;
  alcohol?: string | null;
};

function SelectField({
  name,
  label,
  value,
  options,
}: {
  name: string;
  label: string;
  value?: string | null;
  options: readonly string[];
}) {
  return (
    <div>
      <Label htmlFor={name}>{label}</Label>
      <Select name={name} defaultValue={value ?? undefined}>
        <SelectTrigger id={name} className="mt-1.5">
          <SelectValue placeholder="Seçiniz" />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o} value={o}>
              {o}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="displayName">Ad Soyad</Label>
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
        <div>
          <Label htmlFor="username">Takma Ad</Label>
          <Input
            id="username"
            name="username"
            defaultValue={defaults.username ?? ""}
            className="mt-1.5"
          />
          {fe.username?.[0] && (
            <p className="mt-1 text-xs text-destructive">{fe.username[0]}</p>
          )}
        </div>
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

      <div className="border-t border-border pt-5">
        <h3 className="mb-1 text-sm font-semibold text-muted-foreground">
          Detay Bilgiler
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <Label htmlFor="phone">Telefon</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              defaultValue={defaults.phone ?? ""}
              placeholder="05XX XXX XX XX"
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="profession">Meslek</Label>
            <Input
              id="profession"
              name="profession"
              defaultValue={defaults.profession ?? ""}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="jobTitle">Ünvan</Label>
            <Input
              id="jobTitle"
              name="jobTitle"
              defaultValue={defaults.jobTitle ?? ""}
              className="mt-1.5"
            />
          </div>

          <SelectField
            name="education"
            label="Eğitim"
            value={defaults.education}
            options={EDUCATION_LEVELS}
          />
          <SelectField
            name="maritalStatus"
            label="Medeni Hal"
            value={defaults.maritalStatus}
            options={MARITAL_STATUSES}
          />
          <SelectField
            name="zodiac"
            label="Burç"
            value={defaults.zodiac}
            options={ZODIAC_SIGNS}
          />

          <SelectField
            name="bodyType"
            label="Vücut Tipi"
            value={defaults.bodyType}
            options={BODY_TYPES}
          />
          <div>
            <Label htmlFor="height">Boy (cm)</Label>
            <Input
              id="height"
              name="height"
              type="number"
              min={120}
              max={230}
              defaultValue={defaults.height ?? ""}
              className="mt-1.5"
            />
            {fe.height?.[0] && (
              <p className="mt-1 text-xs text-destructive">{fe.height[0]}</p>
            )}
          </div>
          <div>
            <Label htmlFor="weight">Kilo (kg)</Label>
            <Input
              id="weight"
              name="weight"
              type="number"
              min={30}
              max={250}
              defaultValue={defaults.weight ?? ""}
              className="mt-1.5"
            />
            {fe.weight?.[0] && (
              <p className="mt-1 text-xs text-destructive">{fe.weight[0]}</p>
            )}
          </div>

          <SelectField
            name="smoking"
            label="Sigara"
            value={defaults.smoking}
            options={SMOKING_OPTIONS}
          />
          <SelectField
            name="alcohol"
            label="Alkol"
            value={defaults.alcohol}
            options={ALCOHOL_OPTIONS}
          />
        </div>
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
