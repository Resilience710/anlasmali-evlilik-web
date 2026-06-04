import Link from "next/link";
import { formatCount } from "@/lib/utils";

type Row = { name: string; slug: string; count: number };

function Item({ href, label, count, active }: { href: string; label: string; count: number; active?: boolean }) {
  return (
    <Link
      href={href}
      className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors hover:bg-elevated ${
        active ? "bg-primary-soft text-primary" : "text-foreground/90"
      }`}
    >
      <span>{label}</span>
      <span className="text-xs text-muted-foreground">{formatCount(count)}</span>
    </Link>
  );
}

export function CategorySidebar({
  total,
  categories,
  cities,
}: {
  total: number;
  categories: Row[];
  cities: Row[];
}) {
  return (
    <div className="rounded-[var(--radius-card)] border border-border bg-surface p-4">
      <h2 className="mb-3 px-1 text-base font-semibold">
        Kategorilere Göre İlanlar
      </h2>
      <div className="flex flex-col gap-0.5">
        <Item href="/ilanlar" label="Tümü" count={total} active />
        {categories.map((c) => (
          <Item
            key={c.slug}
            href={`/ilanlar?kategori=${c.slug}`}
            label={c.name}
            count={c.count}
          />
        ))}
        <div className="my-1.5 h-px bg-border" />
        {cities.map((c) => (
          <Item
            key={c.slug}
            href={`/ilanlar?sehir=${c.slug}`}
            label={c.name}
            count={c.count}
          />
        ))}
      </div>
      <Link
        href="/ilanlar"
        className="mt-3 block rounded-xl border border-border py-2 text-center text-sm font-medium transition-colors hover:bg-elevated"
      >
        Tüm Kategoriler
      </Link>
    </div>
  );
}
