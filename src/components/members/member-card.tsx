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

export function MemberCard({ member }: { member: Member }) {
  return (
    <Link
      href={`/uyeler/${member.id}`}
      className="card-hover flex w-full min-w-0 flex-col items-center gap-2 rounded-[var(--radius-card)] border border-border bg-surface p-3 text-center shadow-card sm:p-5"
    >
      <div className="relative">
        <Avatar className="h-20 w-20">
          {member.avatarUrl && (
            <AvatarImage src={member.avatarUrl} alt={member.displayName} />
          )}
          <AvatarFallback className="text-lg">
            {initials(member.displayName)}
          </AvatarFallback>
        </Avatar>
        {member.online && (
          <span className="absolute bottom-1 right-1 h-4 w-4 rounded-full border-2 border-surface bg-success" />
        )}
      </div>
      <p className="flex max-w-full items-center justify-center gap-1 font-semibold">
        <span className="truncate">{member.displayName}</span>
        {member.verified && (
          <BadgeCheck
            className="size-4 shrink-0 text-primary"
            aria-label="Doğrulanmış üye"
          />
        )}
      </p>
      <p className="text-xs text-muted-foreground">
        {[
          member.gender ? GENDER_LABELS[member.gender as Gender] : null,
          member.age ? `${member.age}` : null,
        ]
          .filter(Boolean)
          .join(", ")}
      </p>
      {member.city && (
        <p className="inline-flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="size-3.5" /> {member.city}
        </p>
      )}
      {(member.maritalStatus || member.bodyType) && (
        <p className="text-[0.7rem] text-muted-foreground">
          {[member.maritalStatus, member.bodyType].filter(Boolean).join(" · ")}
        </p>
      )}
      <span className="mt-1 rounded-md bg-surface-2 px-2 py-0.5 text-[0.7rem] text-muted-foreground">
        {member.listingCount} ilan
      </span>
    </Link>
  );
}
