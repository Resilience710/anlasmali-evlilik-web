"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

const ALL = "__all__";

export function MemberFilters({
  cities,
  current,
}: {
  cities: { id: string; name: string; slug: string }[];
  current: { sehir?: string; cinsiyet?: string };
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

  return (
    <div className="grid grid-cols-1 gap-3 rounded-[var(--radius-card)] border border-border bg-surface p-4 sm:grid-cols-2">
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
            <SelectItem key={c.id} value={c.slug}>
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
          <SelectValue placeholder="Cinsiyet" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>Tümü</SelectItem>
          <SelectItem value="FEMALE">Kadın</SelectItem>
          <SelectItem value="MALE">Erkek</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
