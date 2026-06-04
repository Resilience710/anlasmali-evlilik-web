"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, X } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

type Opt = { id: string; name: string; slug?: string };

const ALL = "__all__";

export function ListingFilters({
  categories,
  cities,
  ageOptions,
  current,
}: {
  categories: Opt[];
  cities: Opt[];
  ageOptions: { label: string; minAge: number; maxAge: number }[];
  current: {
    kategori?: string;
    sehir?: string;
    cinsiyet?: string;
    yas?: string;
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
    current.kategori || current.sehir || current.cinsiyet || current.yas;

  return (
    <div className="rounded-[var(--radius-card)] border border-border bg-surface p-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Select
          value={current.kategori ?? ALL}
          onValueChange={(v) => setParam("kategori", v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Kategori" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Tüm Kategoriler</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.slug ?? c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={current.sehir ?? ALL}
          onValueChange={(v) => setParam("sehir", v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Şehir" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Tüm Şehirler</SelectItem>
            {cities.map((c) => (
              <SelectItem key={c.id} value={c.slug ?? c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={current.cinsiyet ?? ALL}
          onValueChange={(v) => setParam("cinsiyet", v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Aradığı Kişi" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Farketmez</SelectItem>
            <SelectItem value="FEMALE">Kadın</SelectItem>
            <SelectItem value="MALE">Erkek</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={current.yas ?? ALL}
          onValueChange={(v) => setParam("yas", v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Yaş" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Tüm Yaşlar</SelectItem>
            {ageOptions.map((a) => (
              <SelectItem key={a.label} value={`${a.minAge}-${a.maxAge}`}>
                {a.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {hasFilters && (
        <div className="mt-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(pathname)}
          >
            <X className="size-4" />
            Filtreleri Temizle
          </Button>
        </div>
      )}
    </div>
  );
}
