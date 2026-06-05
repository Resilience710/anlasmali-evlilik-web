import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/site";
import { SettingsForm } from "@/components/admin/settings-form";

export const metadata: Metadata = { title: "Site Ayarları — Yönetim" };

export default async function AdminSettingsPage() {
  const s = await getSiteSettings();

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-2xl font-bold">Site Ayarları</h1>
      <SettingsForm
        defaults={{
          siteName: s.siteName,
          tagline: s.tagline,
          logoUrl: s.logoUrl,
          heroTitle: s.heroTitle,
          heroSubtitle: s.heroSubtitle,
          aboutText: s.aboutText,
          contactEmail: s.contactEmail,
          contactPhone: s.contactPhone,
          termsText: s.termsText,
          privacyText: s.privacyText,
          contactText: s.contactText,
          happyCount: s.happyCount,
          social: s.social,
        }}
      />
    </div>
  );
}
