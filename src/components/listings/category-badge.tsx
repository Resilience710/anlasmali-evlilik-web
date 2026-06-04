import { cn } from "@/lib/utils";

export function CategoryBadge({
  name,
  slug,
  className,
}: {
  name: string;
  slug?: string;
  className?: string;
}) {
  const rose = slug === "bayan-ariyor";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium",
        rose
          ? "border-pink-500/30 bg-pink-500/10 text-pink-400"
          : "border-primary/30 bg-primary-soft text-primary",
        className
      )}
    >
      {name}
    </span>
  );
}
