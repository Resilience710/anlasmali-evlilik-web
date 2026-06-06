import type { Metadata } from "next";
import Link from "next/link";
import { LifeBuoy, MessageSquare, FileText } from "lucide-react";

export const metadata: Metadata = { title: "Yardım" };

const CARDS = [
  {
    icon: FileText,
    title: "İlan Oluşturma",
    desc: "İlan vermek için üye olun ve 'İlan Oluştur' adımlarını takip edin.",
    href: "/hesabim/ilan-olustur",
  },
  {
    icon: MessageSquare,
    title: "Mesajlaşma",
    desc: "İlgilendiğiniz ilanlarda 'Mesaj Yaz' ile iletişime geçin.",
    href: "/ilanlar",
  },
  {
    icon: LifeBuoy,
    title: "Sıkça Sorulan Sorular",
    desc: "En çok merak edilen soruların yanıtlarına göz atın.",
    href: "/sss",
  },
];

export default function HelpPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold sm:text-3xl">Yardım</h1>
      <p className="mt-2 text-muted-foreground">
        Size nasıl yardımcı olabiliriz?
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {CARDS.map((c) => (
          <Link
            key={c.title}
            href={c.href}
            className="flex flex-col gap-2 rounded-[var(--radius-card)] border border-border bg-surface p-5 transition-colors hover:border-primary/40"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-soft text-primary">
              <c.icon className="size-5" />
            </span>
            <h2 className="font-semibold">{c.title}</h2>
            <p className="text-sm text-muted-foreground">{c.desc}</p>
          </Link>
        ))}
      </div>
      <p className="mt-8 text-sm text-muted-foreground">
        Hâlâ yardıma mı ihtiyacınız var?{" "}
        <Link href="/iletisim" className="text-primary hover:underline">
          Bizimle iletişime geçin
        </Link>
        .
      </p>
    </div>
  );
}
