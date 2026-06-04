import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { CategoryBadge } from "./category-badge";
import type { ListingCard } from "@/lib/listings";
import { initials, timeAgo } from "@/lib/utils";

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <span className="flex flex-col leading-tight">
      <span className="text-[0.65rem] uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <span className="text-sm font-medium">{value}</span>
    </span>
  );
}

export function ListingRow({ listing }: { listing: ListingCard }) {
  const name = listing.author.profile?.displayName ?? "Üye";
  const avatar = listing.author.profile?.avatarUrl;
  const when = listing.publishedAt ?? listing.createdAt;

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border-soft bg-surface-2 p-3 transition-colors hover:border-border sm:flex-row sm:items-center">
      <Link
        href={`/ilanlar/${listing.slug}`}
        className="flex min-w-0 flex-1 items-center gap-3"
      >
        <Avatar className="h-11 w-11 shrink-0">
          {avatar && <AvatarImage src={avatar} alt={name} />}
          <AvatarFallback>{initials(name)}</AvatarFallback>
        </Avatar>
        <span className="min-w-0">
          <span className="block truncate font-medium hover:text-primary">
            {listing.title}
          </span>
          <span className="mt-1 flex items-center gap-2">
            <CategoryBadge
              name={listing.category.name}
              slug={listing.category.slug}
            />
          </span>
        </span>
      </Link>

      <div className="hidden items-center gap-6 md:flex">
        <Meta label="Kategori" value="Evlilik" />
        <Meta label="Yaş" value={String(listing.age)} />
        <Meta label="Şehir" value={listing.city.name} />
        <Meta label="Eklenme" value={timeAgo(when)} />
      </div>

      <div className="flex items-center justify-between gap-3 md:justify-end">
        <span className="flex items-center gap-3 text-xs text-muted-foreground md:hidden">
          <span>{listing.age} yaş</span>
          <span>·</span>
          <span>{listing.city.name}</span>
          <span>·</span>
          <span>{timeAgo(when)}</span>
        </span>
        <Button asChild variant="outline" size="sm">
          <Link href={`/ilanlar/${listing.slug}#mesaj`}>
            <MessageSquare />
            Mesaj Yaz
          </Link>
        </Button>
      </div>
    </div>
  );
}
