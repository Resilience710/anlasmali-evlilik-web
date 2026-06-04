import { ShieldCheck, Lock, MessagesSquare, BadgeCheck } from "lucide-react";

const FEATURES = [
  {
    icon: ShieldCheck,
    title: "Güvenli Ortam",
    desc: "Kimlik doğrulama sistemi ile güvenli kullanım.",
  },
  {
    icon: Lock,
    title: "Gizliliğiniz Korunur",
    desc: "Fotoğraflarınızı sadece seçtiğiniz kişi görebilir.",
  },
  {
    icon: MessagesSquare,
    title: "Kolay İletişim",
    desc: "İlgilendiğiniz ilan sahiplerine mesaj gönderebilirsiniz.",
  },
  {
    icon: BadgeCheck,
    title: "Ciddi Üyeler",
    desc: "Gerçek evlilik düşünen üyelerle tanışın.",
  },
];

export function FeatureCards() {
  return (
    <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {FEATURES.map((f) => (
        <div
          key={f.title}
          className="flex flex-col gap-2 rounded-[var(--radius-card)] border border-border bg-surface p-4"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-soft text-primary">
            <f.icon className="size-5" />
          </span>
          <h3 className="text-sm font-semibold">{f.title}</h3>
          <p className="text-xs leading-relaxed text-muted-foreground">
            {f.desc}
          </p>
        </div>
      ))}
    </section>
  );
}
