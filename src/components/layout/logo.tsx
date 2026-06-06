import Link from "next/link";
import { HeartHandshake } from "lucide-react";

export function Logo({
  siteName = "anlaşmalievlilik.com",
  tagline = "Ciddi İlişki, Mutlu Evlilik",
  logoUrl,
  compact = false,
}: {
  siteName?: string;
  tagline?: string;
  logoUrl?: string | null;
  compact?: boolean;
}) {
  // "anlaşmali" + "evlilik" + ".com" -> evlilik vurgulu
  const lower = siteName.toLowerCase();
  let pre = siteName;
  let mid = "";
  let post = "";
  const idx = lower.indexOf("evlilik");
  if (idx >= 0) {
    pre = siteName.slice(0, idx);
    mid = siteName.slice(idx, idx + 7);
    post = siteName.slice(idx + 7);
  }

  return (
    <Link href="/" className="flex min-w-0 items-center gap-2.5">
      {logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logoUrl} alt={siteName} className="h-9 w-auto shrink-0" />
      ) : (
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
          <HeartHandshake className="size-6" />
        </span>
      )}
      <span className="flex min-w-0 flex-col leading-none">
        <span className="truncate text-[1.05rem] font-bold tracking-tight">
          {mid ? (
            <>
              {pre}
              <span className="text-primary">{mid}</span>
              {post}
            </>
          ) : (
            siteName
          )}
        </span>
        {!compact && (
          <span className="mt-0.5 hidden truncate text-[0.7rem] text-muted-foreground sm:block">
            {tagline}
          </span>
        )}
      </span>
    </Link>
  );
}
