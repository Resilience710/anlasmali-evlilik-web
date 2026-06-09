"use client";

import { useActionState } from "react";
import { updateSiteSettingsAction } from "@/app/_actions/admin";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "@/components/image-upload";

type Defaults = {
  siteName: string;
  tagline?: string | null;
  logoUrl?: string | null;
  heroImageUrl?: string | null;
  heroTitle: string;
  heroSubtitle?: string | null;
  aboutText?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  termsText?: string | null;
  privacyText?: string | null;
  disclaimerText?: string | null;
  contactText?: string | null;
  happyCount: number;
  social: { facebook?: string; instagram?: string; x?: string; youtube?: string };
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[var(--radius-card)] border border-border bg-surface p-6">
      <h2 className="mb-4 font-semibold">{title}</h2>
      <div className="flex flex-col gap-4">{children}</div>
    </div>
  );
}

export function SettingsForm({ defaults }: { defaults: Defaults }) {
  const [state, formAction, pending] = useActionState(updateSiteSettingsAction, {});

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {state.success && (
        <p className="rounded-lg border border-success/30 bg-success/10 px-3 py-2 text-sm text-success">
          {state.success}
        </p>
      )}

      <Section title="Genel">
        <div>
          <Label>Logo</Label>
          <div className="mt-1.5">
            <ImageUpload name="logoUrl" defaultUrl={defaults.logoUrl} label="Logo" rounded="lg" />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="siteName">Site Adı</Label>
            <Input id="siteName" name="siteName" defaultValue={defaults.siteName} className="mt-1.5" required />
          </div>
          <div>
            <Label htmlFor="tagline">Slogan</Label>
            <Input id="tagline" name="tagline" defaultValue={defaults.tagline ?? ""} className="mt-1.5" />
          </div>
        </div>
      </Section>

      <Section title="Ana Sayfa">
        <div>
          <Label>Hero Görseli</Label>
          <p className="mb-1.5 mt-0.5 text-xs text-muted-foreground">
            Önerilen: 1600×600 px (yatay banner), WebP/JPG, ≤300KB. Yüklenirse
            ana sayfada başlık/buton yerine bu görsel gösterilir.
          </p>
          <ImageUpload name="heroImageUrl" defaultUrl={defaults.heroImageUrl} label="Hero görseli" rounded="lg" />
        </div>
        <div>
          <Label htmlFor="heroTitle">Hero Başlığı (görsel yoksa)</Label>
          <Input id="heroTitle" name="heroTitle" defaultValue={defaults.heroTitle} className="mt-1.5" required />
        </div>
        <div>
          <Label htmlFor="heroSubtitle">Hero Alt Başlığı</Label>
          <Textarea id="heroSubtitle" name="heroSubtitle" defaultValue={defaults.heroSubtitle ?? ""} rows={2} className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="happyCount">Mutlu Evlilik Sayısı</Label>
          <Input id="happyCount" name="happyCount" type="number" defaultValue={defaults.happyCount} className="mt-1.5 w-40" />
        </div>
      </Section>

      <Section title="İçerik">
        <div>
          <Label htmlFor="aboutText">Hakkımızda</Label>
          <Textarea id="aboutText" name="aboutText" defaultValue={defaults.aboutText ?? ""} rows={4} className="mt-1.5" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="termsText">Kullanım Şartları</Label>
            <Textarea id="termsText" name="termsText" defaultValue={defaults.termsText ?? ""} rows={4} className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="privacyText">Gizlilik Politikası</Label>
            <Textarea id="privacyText" name="privacyText" defaultValue={defaults.privacyText ?? ""} rows={4} className="mt-1.5" />
          </div>
        </div>
        <div>
          <Label htmlFor="disclaimerText">Sorumluluk Reddi</Label>
          <Textarea
            id="disclaimerText"
            name="disclaimerText"
            defaultValue={defaults.disclaimerText ?? ""}
            rows={6}
            className="mt-1.5"
            placeholder="Boş bırakılırsa hazır (varsayılan) metin gösterilir. Buraya yazarsanız sayfa bu metni gösterir."
          />
        </div>
      </Section>

      <Section title="İletişim & Sosyal Medya">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="contactEmail">İletişim E-posta</Label>
            <Input id="contactEmail" name="contactEmail" type="email" defaultValue={defaults.contactEmail ?? ""} className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="contactPhone">İletişim Telefon</Label>
            <Input id="contactPhone" name="contactPhone" defaultValue={defaults.contactPhone ?? ""} className="mt-1.5" />
          </div>
        </div>
        <div>
          <Label htmlFor="contactText">İletişim Sayfası Metni (sol taraf)</Label>
          <Textarea
            id="contactText"
            name="contactText"
            defaultValue={defaults.contactText ?? ""}
            rows={4}
            className="mt-1.5"
            placeholder="Şikayet, reklam ve diğer talepleriniz için bize ulaşın..."
          />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="facebook">Facebook</Label>
            <Input id="facebook" name="facebook" defaultValue={defaults.social.facebook ?? ""} className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="instagram">Instagram</Label>
            <Input id="instagram" name="instagram" defaultValue={defaults.social.instagram ?? ""} className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="x">X (Twitter)</Label>
            <Input id="x" name="x" defaultValue={defaults.social.x ?? ""} className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="youtube">YouTube</Label>
            <Input id="youtube" name="youtube" defaultValue={defaults.social.youtube ?? ""} className="mt-1.5" />
          </div>
        </div>
      </Section>

      <Button type="submit" size="lg" disabled={pending} className="self-start">
        {pending ? "Kaydediliyor..." : "Ayarları Kaydet"}
      </Button>
    </form>
  );
}
