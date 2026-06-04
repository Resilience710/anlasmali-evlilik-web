import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/site";

export const metadata: Metadata = { title: "Gizlilik Politikası" };

export default async function PrivacyPage() {
  const s = await getSiteSettings();
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold">Gizlilik Politikası</h1>
      <p className="mt-4 whitespace-pre-line leading-relaxed text-foreground/90">
        {s.privacyText ?? "Gizlilik politikası yakında eklenecektir."}
      </p>
    </div>
  );
}
