import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/site";

export const metadata: Metadata = { title: "Kullanım Şartları" };

export default async function TermsPage() {
  const s = await getSiteSettings();
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold">Kullanım Şartları</h1>
      <p className="mt-4 whitespace-pre-line leading-relaxed text-foreground/90">
        {s.termsText ?? "Kullanım şartları yakında eklenecektir."}
      </p>
    </div>
  );
}
