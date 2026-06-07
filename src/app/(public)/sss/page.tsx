import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/site";
import { JsonLd } from "@/components/seo/json-ld";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Sıkça Sorulan Sorular - Anlaşmalı Evlilik ve Üyelik",
  description:
    "Anlaşmalı evlilik sitesi üyeliği, ilan yayınlama, güvenlik, gizlilik ve mesajlaşma hakkında sıkça sorulan sorular.",
  path: "/sss",
  keywords: ["evlilik sitesi soruları", "anlaşmalı evlilik üyelik", "evlilik ilanı güvenlik"],
});

export default async function FaqPage() {
  const s = await getSiteSettings();
  const faq = s.faq ?? [];
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      {faq.length > 0 && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faq.map((item) => ({
              "@type": "Question",
              name: item.q,
              acceptedAnswer: {
                "@type": "Answer",
                text: item.a,
              },
            })),
          }}
        />
      )}
      <h1 className="text-2xl font-bold sm:text-3xl">Sıkça Sorulan Sorular</h1>
      {faq.length === 0 ? (
        <p className="mt-4 text-muted-foreground">Henüz soru eklenmemiş.</p>
      ) : (
        <div className="mt-6 flex flex-col gap-3">
          {faq.map((item, i) => (
            <details
              key={i}
              className="group rounded-[var(--radius-card)] border border-border bg-surface p-4"
            >
              <summary className="cursor-pointer list-none font-medium marker:hidden">
                {item.q}
              </summary>
              <p className="mt-2 text-sm text-muted-foreground">{item.a}</p>
            </details>
          ))}
        </div>
      )}
    </div>
  );
}
