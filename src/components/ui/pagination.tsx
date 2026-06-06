import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function Pagination({
  page,
  totalPages,
  baseQuery,
}: {
  page: number;
  totalPages: number;
  baseQuery: Record<string, string | undefined>;
}) {
  if (totalPages <= 1) return null;

  const makeHref = (p: number) => {
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(baseQuery)) {
      if (v) sp.set(k, v);
    }
    sp.set("page", String(p));
    return `?${sp.toString()}`;
  };

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1
  );

  return (
    <nav className="flex flex-wrap items-center justify-center gap-1.5">
      {page > 1 && (
        <Link
          href={makeHref(page - 1)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border hover:bg-elevated"
        >
          <ChevronLeft className="size-4" />
        </Link>
      )}
      {pages.map((p, i) => {
        const prev = pages[i - 1];
        const gap = prev && p - prev > 1;
        return (
          <span key={p} className="flex items-center gap-1.5">
            {gap && <span className="px-1 text-muted-foreground">…</span>}
            <Link
              href={makeHref(p)}
              className={cn(
                "flex h-9 min-w-9 items-center justify-center rounded-lg border px-2 text-sm",
                p === page
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border hover:bg-elevated"
              )}
            >
              {p}
            </Link>
          </span>
        );
      })}
      {page < totalPages && (
        <Link
          href={makeHref(page + 1)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border hover:bg-elevated"
        >
          <ChevronRight className="size-4" />
        </Link>
      )}
    </nav>
  );
}
