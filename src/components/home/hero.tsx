import Link from "next/link";
import { Search, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  const words = title.split(" ");

  return (
    <section className="flex min-w-0 flex-col justify-center rounded-[var(--radius-card)] border border-border bg-gradient-to-br from-surface to-surface-2 p-7 sm:p-9">
      <h1 className="text-3xl font-bold leading-tight tracking-tight break-words sm:text-4xl md:text-[2.6rem]">
        {words.map((w, i) => {
          const isBrand = /vlilik/i.test(w);
          return (
            <span key={i} className={isBrand ? "text-gradient-primary" : ""}>
              {w}
              {i < words.length - 1 ? " " : ""}
            </span>
          );
        })}
      </h1>
      <p className="mt-4 max-w-xl text-muted-foreground">{subtitle}</p>
      <div className="mt-7 flex flex-col gap-3 sm:flex-row">
        <Button asChild size="lg">
          <Link href="/ilanlar">
            <Search />
            İlanlara Göz At
          </Link>
        </Button>
        <Button asChild size="lg" variant="secondary">
          <Link href="/hesabim/ilan-olustur">
            <PlusCircle />
            İlan Oluştur
          </Link>
        </Button>
      </div>
    </section>
  );
}
