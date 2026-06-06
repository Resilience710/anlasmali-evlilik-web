import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/site";
import { FeatureCards } from "@/components/home/feature-cards";

export const metadata: Metadata = { title: "Hakkımızda" };

export default async function AboutPage() {
  const s = await getSiteSettings();
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold sm:text-3xl">Hakkımızda</h1>
      <p className="mt-4 whitespace-pre-line leading-relaxed text-foreground/90">
        {s.aboutText ??
          "Ciddi ilişki ve evlilik düşünen bireyleri güvenli bir ortamda buluşturuyoruz."}
      </p>
      <div className="mt-8">
        <FeatureCards />
      </div>
    </div>
  );
}
