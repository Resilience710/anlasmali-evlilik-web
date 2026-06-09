import Link from "next/link";
import { MapPin, BadgeCheck } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { initials } from "@/lib/utils";
import { GENDER_LABELS, type Gender } from "@/lib/constants";

type Member = {
  id: string;
  online: boolean;
  displayName: string;
  avatarUrl: string | null;
  gender: string | null;
  age: number | null;
  bio: string | null;
  city: string | null;
  maritalStatus?: string | null;
  bodyType?: string | null;
  verified?: boolean;
  listingCount: number;
};

export function MemberRow({ member }: { member: Member }) {
  const meta = [
    member.gender ? GENDER_LABELS[member.gender as Gender] : null,
    member.age ? `${member.age} yaş` : null,
    member.maritalStatus,
    member.bodyType,
  ].filter(Boolean);

  return (
    <Link
      href={`/uyeler/${member.id}`}
      className="card-hover flex w-full min-w-0 items-center gap-3 rounded-[var(--radius-card)] border border-border bg-surface p-3 shadow-card sm:gap-4 sm:p-4"
    >
      <div className="relative shrink-0">
        <Avatar className="h-14 w-14 sm:h-16 sm:w-16">
          {member.avatarUrl && (
            <AvatarImage src={member.avatarUrl} alt={member.displayName} />
          )}
          <AvatarFallback>{initials(member.displayName)}</AvatarFallback>
        </Avatar>
        {member.online && (
          <span className="absolute bottom-0.5 right-0.5 h-3.5 w-3.5 rounded-full border-2 border-surface bg-success" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="flex min-w-0 items-center gap-1 font-semibold">
          <span className="truncate">{member.displayName}</span>
          {member.verified && (
            <BadgeCheck
              className="size-4 shrink-0 text-primary"
              aria-label="Doğrulanmış üye"
            />
          )}
        </p>
        {meta.length > 0 && (
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {meta.join(" · ")}
          </p>
        )}
        {member.city && (
          <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="size-3.5" /> {member.city}
          </p>
        )}
      </div>

      <span className="shrink-0 rounded-md bg-surface-2 px-2 py-0.5 text-[0.7rem] text-muted-foreground">
        {member.listingCount} ilan
      </span>
    </Link>
  );
}
