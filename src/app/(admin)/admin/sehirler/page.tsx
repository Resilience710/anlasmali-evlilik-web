import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { upsertCityAction } from "@/app/_actions/admin";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CatalogDeleteButton } from "@/components/admin/simple-action-buttons";

export const metadata: Metadata = { title: "Şehirler — Yönetim" };

export default async function AdminCitiesPage() {
  const cities = await prisma.city.findMany({ orderBy: { order: "asc" } });

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-2xl font-bold">Şehirler</h1>

      <form
        action={upsertCityAction}
        className="flex flex-wrap items-end gap-3 rounded-[var(--radius-card)] border border-border bg-surface p-4"
      >
        <div className="flex-1">
          <label className="text-sm text-muted-foreground">Şehir Adı</label>
          <Input name="name" required className="mt-1.5" placeholder="Örn: İstanbul" />
        </div>
        <div className="w-24">
          <label className="text-sm text-muted-foreground">Sıra</label>
          <Input name="order" type="number" defaultValue={0} className="mt-1.5" />
        </div>
        <label className="flex items-center gap-2 pb-2.5 text-sm">
          <input type="checkbox" name="isActive" defaultChecked className="h-4 w-4 accent-[var(--color-primary)]" />
          Aktif
        </label>
        <Button type="submit">Ekle</Button>
      </form>

      <div className="flex flex-col gap-2">
        {cities.map((c) => (
          <form
            key={c.id}
            action={upsertCityAction}
            className="flex flex-wrap items-end gap-3 rounded-[var(--radius-card)] border border-border bg-surface p-4"
          >
            <input type="hidden" name="id" value={c.id} />
            <div className="flex-1">
              <label className="text-xs text-muted-foreground">Ad ({c.slug})</label>
              <Input name="name" defaultValue={c.name} className="mt-1" />
            </div>
            <div className="w-20">
              <label className="text-xs text-muted-foreground">Sıra</label>
              <Input name="order" type="number" defaultValue={c.order} className="mt-1" />
            </div>
            <label className="flex items-center gap-2 pb-2.5 text-sm">
              <input type="checkbox" name="isActive" defaultChecked={c.isActive} className="h-4 w-4 accent-[var(--color-primary)]" />
              Aktif
            </label>
            {!c.isActive && <Badge variant="neutral">Pasif</Badge>}
            <Button type="submit" variant="outline" size="sm">Kaydet</Button>
            <CatalogDeleteButton kind="city" id={c.id} />
          </form>
        ))}
      </div>
    </div>
  );
}
