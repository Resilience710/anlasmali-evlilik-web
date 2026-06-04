import type { Metadata } from "next";
import { Mail, Phone } from "lucide-react";
import { getSiteSettings } from "@/lib/site";
import { ContactForm } from "@/components/contact-form";

export const metadata: Metadata = { title: "İletişim" };

export default async function ContactPage() {
  const s = await getSiteSettings();
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold">İletişim</h1>
      <p className="mt-2 text-muted-foreground">
        Sorularınız için bize ulaşın.
      </p>

      <div className="mt-6 flex flex-wrap gap-4">
        {s.contactEmail && (
          <a
            href={`mailto:${s.contactEmail}`}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2.5 text-sm hover:bg-elevated"
          >
            <Mail className="size-4 text-primary" /> {s.contactEmail}
          </a>
        )}
        {s.contactPhone && (
          <span className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2.5 text-sm">
            <Phone className="size-4 text-primary" /> {s.contactPhone}
          </span>
        )}
      </div>

      <div className="mt-8 rounded-[var(--radius-card)] border border-border bg-surface p-6">
        <ContactForm />
      </div>
    </div>
  );
}
