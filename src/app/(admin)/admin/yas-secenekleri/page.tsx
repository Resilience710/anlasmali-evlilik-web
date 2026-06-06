import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { upsertAgeOptionAction } from "@/app/_actions/admin";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CatalogDeleteButton } from "@/components/admin/simple-action-buttons";

export const metadata: Metadata = { title: "Yaş Seçenekleri — Yönetim" };

export default async function AdminAgeOptionsPage() {
  const options = await prisma.ageOption.findMany({ orderBy: { order: "asc" } });

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-2xl font-bold">Yaş Seçenekleri</h1>
      <p className="text-sm text-muted-foreground">
        İlan filtrelerinde kullanılan yaş aralıkları.
      </p>

      <form
        action={upsertAgeOptionAction}
        className="flex flex-col gap-3 rounded-[var(--radius-card)] border border-border bg-surface p-4 sm:flex-row sm:flex-wrap sm:items-end"
      >
        <div className="w-28">
          <label className="text-sm text-muted-foreground">Etiket</label>
          <Input name="label" required className="mt-1.5" placeholder="26-30" />
        </div>
        <div className="w-20">
          <label className="text-sm text-muted-foreground">Min</label>
          <Input name="minAge" type="number" required className="mt-1.5" />
        </div>
        <div className="w-20">
          <label className="text-sm text-muted-foreground">Max</label>
          <Input name="maxAge" type="number" required className="mt-1.5" />
        </div>
        <div className="w-20">
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
        {options.map((o) => (
          <form
            key={o.id}
            action={upsertAgeOptionAction}
            className="flex flex-col gap-3 rounded-[var(--radius-card)] border border-border bg-surface p-4 sm:flex-row sm:flex-wrap sm:items-end"
          >
            <input type="hidden" name="id" value={o.id} />
            <div className="w-28">
              <label className="text-xs text-muted-foreground">Etiket</label>
              <Input name="label" defaultValue={o.label} className="mt-1" />
            </div>
            <div className="w-20">
              <label className="text-xs text-muted-foreground">Min</label>
              <Input name="minAge" type="number" defaultValue={o.minAge} className="mt-1" />
            </div>
            <div className="w-20">
              <label className="text-xs text-muted-foreground">Max</label>
              <Input name="maxAge" type="number" defaultValue={o.maxAge} className="mt-1" />
            </div>
            <div className="w-20">
              <label className="text-xs text-muted-foreground">Sıra</label>
              <Input name="order" type="number" defaultValue={o.order} className="mt-1" />
            </div>
            <label className="flex items-center gap-2 pb-2.5 text-sm">
              <input type="checkbox" name="isActive" defaultChecked={o.isActive} className="h-4 w-4 accent-[var(--color-primary)]" />
              Aktif
            </label>
            {!o.isActive && <Badge variant="neutral">Pasif</Badge>}
            <Button type="submit" variant="outline" size="sm">Kaydet</Button>
            <CatalogDeleteButton kind="age" id={o.id} />
          </form>
        ))}
      </div>
    </div>
  );
}
