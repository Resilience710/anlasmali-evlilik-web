import Link from "next/link";
import { MapPin } from "lucide-react";
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
  listingCount: number;
};

export function MemberCard({ member }: { member: Member }) {
  return (
    <Link
      href={`/uyeler/${member.id}`}
      className="flex flex-col items-center gap-2 rounded-[var(--radius-card)] border border-border bg-surface p-5 text-center transition-colors hover:border-primary/40"
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
      <p className="font-semibold">{member.displayName}</p>
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
