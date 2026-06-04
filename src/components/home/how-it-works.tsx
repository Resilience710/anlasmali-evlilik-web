import { UserPlus, FilePlus2, MessageCircle, HeartHandshake } from "lucide-react";

const STEPS = [
  {
    icon: UserPlus,
    title: "Üye Ol",
    desc: "Ücretsiz üye olarak sisteme kayıt olun.",
  },
  {
    icon: FilePlus2,
    title: "İlan Oluştur",
    desc: "Kendinizi tanıtan bir ilan oluşturun.",
  },
  {
    icon: MessageCircle,
    title: "Mesajlaş",
    desc: "İlgilendiğiniz üyelerle mesajlaşın.",
  },
  {
    icon: HeartHandshake,
    title: "Tanış",
    desc: "Birbirinizi tanıyın ve geleceğinizi birlikte kurun.",
  },
];

export function HowItWorks() {
  return (
    <div className="rounded-[var(--radius-card)] border border-border bg-surface p-4">
      <h2 className="mb-3 px-1 text-base font-semibold">Nasıl Çalışır?</h2>
      <ol className="flex flex-col gap-3">
        {STEPS.map((s, i) => (
          <li key={s.title} className="flex items-start gap-3">
            <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
              <s.icon className="size-[1.1rem]" />
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[0.6rem] font-bold text-primary-foreground">
                {i + 1}
              </span>
            </span>
            <span className="flex flex-col">
              <span className="text-sm font-semibold">{s.title}</span>
              <span className="text-xs text-muted-foreground">{s.desc}</span>
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
