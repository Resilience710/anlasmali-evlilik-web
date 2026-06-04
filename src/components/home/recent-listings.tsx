import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ListingRow } from "@/components/listings/listing-row";
import type { ListingCard } from "@/lib/listings";

export function RecentListings({ listings }: { listings: ListingCard[] }) {
  return (
    <section className="rounded-[var(--radius-card)] border border-border bg-surface p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Son Eklenen İlanlar</h2>
        <Link
          href="/ilanlar"
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          Tüm İlanları Gör
          <ArrowRight className="size-4" />
        </Link>
      </div>

      {listings.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          Henüz ilan yok. İlk ilanı siz oluşturun!
        </p>
      ) : (
        <div className="flex flex-col gap-2.5">
          {listings.map((l) => (
            <ListingRow key={l.id} listing={l} />
          ))}
        </div>
      )}

      <div className="mt-4">
        <Link
          href="/ilanlar"
          className="flex items-center justify-center gap-2 rounded-xl border border-border bg-surface-2 py-2.5 text-sm font-medium transition-colors hover:bg-elevated"
        >
          Tüm İlanları Gör
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </section>
  );
}
