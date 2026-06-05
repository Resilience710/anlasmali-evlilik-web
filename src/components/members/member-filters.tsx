"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { X } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  MARITAL_STATUSES,
  BODY_TYPES,
  SMOKING_OPTIONS,
} from "@/lib/constants";

const ALL = "__all__";

export function MemberFilters({
  cities,
  ageOptions,
  current,
}: {
  cities: { id: string; name: string; slug: string }[];
  ageOptions: { label: string; minAge: number; maxAge: number }[];
  current: {
    sehir?: string;
    cinsiyet?: string;
    yas?: string;
    medeni?: string;
    vucut?: string;
    sigara?: string;
  };
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const setParam = (key: string, value?: string) => {
    const next = new URLSearchParams(params.toString());
    if (!value || value === ALL) next.delete(key);
    else next.set(key, value);
    next.delete("page");
    router.push(`${pathname}?${next.toString()}`);
  };

  const hasFilters =
    current.sehir ||
    current.cinsiyet ||
    current.yas ||
    current.medeni ||
    current.vucut ||
    current.sigara;

  return (
    <div className="rounded-[var(--radius-card)] border border-border bg-surface p-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
        <Select value={current.sehir ?? ALL} onValueChange={(v) => setParam("sehir", v)}>
          <SelectTrigger><SelectValue placeholder="Şehir" /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Tüm Şehirler</SelectItem>
            {cities.map((c) => (
              <SelectItem key={c.id} value={c.slug}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={current.cinsiyet ?? ALL} onValueChange={(v) => setParam("cinsiyet", v)}>
          <SelectTrigger><SelectValue placeholder="Cinsiyet" /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Cinsiyet</SelectItem>
            <SelectItem value="FEMALE">Kadın</SelectItem>
            <SelectItem value="MALE">Erkek</SelectItem>
          </SelectContent>
        </Select>

        <Select value={current.yas ?? ALL} onValueChange={(v) => setParam("yas", v)}>
          <SelectTrigger><SelectValue placeholder="Yaş" /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Tüm Yaşlar</SelectItem>
            {ageOptions.map((a) => (
              <SelectItem key={a.label} value={`${a.minAge}-${a.maxAge}`}>
                {a.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={current.medeni ?? ALL} onValueChange={(v) => setParam("medeni", v)}>
          <SelectTrigger><SelectValue placeholder="Medeni Hal" /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Medeni Hal</SelectItem>
            {MARITAL_STATUSES.map((m) => (
              <SelectItem key={m} value={m}>{m}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={current.vucut ?? ALL} onValueChange={(v) => setParam("vucut", v)}>
          <SelectTrigger><SelectValue placeholder="Vücut Tipi" /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Vücut Tipi</SelectItem>
            {BODY_TYPES.map((b) => (
              <SelectItem key={b} value={b}>{b}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={current.sigara ?? ALL} onValueChange={(v) => setParam("sigara", v)}>
          <SelectTrigger><SelectValue placeholder="Sigara" /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Sigara</SelectItem>
            {SMOKING_OPTIONS.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {hasFilters && (
        <div className="mt-3">
          <Button variant="ghost" size="sm" onClick={() => router.push(pathname)}>
            <X className="size-4" />
            Filtreleri Temizle
          </Button>
        </div>
      )}
    </div>
  );
}
