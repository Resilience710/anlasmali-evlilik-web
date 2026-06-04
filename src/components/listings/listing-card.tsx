import Link from "next/link";
import { MapPin, Cake, Clock } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { CategoryBadge } from "./category-badge";
import type { ListingCard as ListingCardData } from "@/lib/listings";
import { initials, timeAgo } from "@/lib/utils";

export function ListingCard({ listing }: { listing: ListingCardData }) {
  const name = listing.author.profile?.displayName ?? "Üye";
  const avatar = listing.author.profile?.avatarUrl;
  const when = listing.publishedAt ?? listing.createdAt;

  return (
    <div className="flex flex-col gap-3 rounded-[var(--radius-card)] border border-border bg-surface p-4 transition-colors hover:border-primary/40">
      <div className="flex items-center gap-3">
        <Avatar className="h-12 w-12">
          {avatar && <AvatarImage src={avatar} alt={name} />}
          <AvatarFallback>{initials(name)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{name}</p>
          <CategoryBadge
            name={listing.category.name}
            slug={listing.category.slug}
          />
        </div>
      </div>

      <Link href={`/ilanlar/${listing.slug}`} className="block">
        <h3 className="line-clamp-2 font-semibold hover:text-primary">
          {listing.title}
        </h3>
      </Link>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <Cake className="size-3.5" /> {listing.age} yaş
        </span>
        <span className="inline-flex items-center gap-1">
          <MapPin className="size-3.5" /> {listing.city.name}
        </span>
        <span className="inline-flex items-center gap-1">
          <Clock className="size-3.5" /> {timeAgo(when)}
        </span>
      </div>

      <div className="mt-1 flex gap-2">
        <Button asChild variant="outline" size="sm" className="flex-1">
          <Link href={`/ilanlar/${listing.slug}`}>Detayı Gör</Link>
        </Button>
        <Button asChild size="sm" className="flex-1">
          <Link href={`/ilanlar/${listing.slug}#mesaj`}>Mesaj Yaz</Link>
        </Button>
      </div>
    </div>
  );
}
