import Link from "next/link";
import { getSiteSettings } from "@/lib/site";
import { Logo } from "./logo";

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden>
      <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.78-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12Z" />
    </svg>
  );
}
function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <line x1="17.5" y1="6.5" x2="17.5" y2="6.5" />
    </svg>
  );
}
function XIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.66l-5.214-6.817-5.966 6.817H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117l11.966 15.644Z" />
    </svg>
  );
}
function YoutubeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden>
      <path d="M23.5 6.2a3 3 0 0 0-2.11-2.13C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.39.52A3 3 0 0 0 .5 6.2 31.2 31.2 0 0 0 0 12a31.2 31.2 0 0 0 .5 5.8 3 3 0 0 0 2.11 2.13c1.89.52 9.39.52 9.39.52s7.5 0 9.39-.52a3 3 0 0 0 2.11-2.13A31.2 31.2 0 0 0 24 12a31.2 31.2 0 0 0-.5-5.8ZM9.6 15.6V8.4l6.2 3.6-6.2 3.6Z" />
    </svg>
  );
}

const FOOTER_LINKS = [
  { href: "/kullanim-sartlari", label: "Kullanım Şartları" },
  { href: "/gizlilik-politikasi", label: "Gizlilik Politikası" },
  { href: "/yardim", label: "Yardım" },
  { href: "/sss", label: "SSS" },
];

export async function SiteFooter() {
  const settings = await getSiteSettings();
  const year = 2024;
  const social = settings.social;

  return (
    <footer className="mt-12 border-t border-border bg-surface-2">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-3">
          <Logo
            siteName={settings.siteName}
            tagline={settings.tagline}
            logoUrl={settings.logoUrl}
          />
          <p className="text-xs text-muted-foreground">
            © {year} {settings.siteName} — Tüm hakları saklıdır.
          </p>
        </div>

        <nav className="flex flex-wrap gap-x-6 gap-y-2">
          {FOOTER_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Bizi Takip Edin</span>
          <div className="flex items-center gap-2">
            {social.facebook && (
              <SocialIcon href={social.facebook} label="Facebook">
                <FacebookIcon />
              </SocialIcon>
            )}
            {social.instagram && (
              <SocialIcon href={social.instagram} label="Instagram">
                <InstagramIcon />
              </SocialIcon>
            )}
            {social.x && (
              <SocialIcon href={social.x} label="X">
                <XIcon />
              </SocialIcon>
            )}
            {social.youtube && (
              <SocialIcon href={social.youtube} label="YouTube">
                <YoutubeIcon />
              </SocialIcon>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}

function SocialIcon({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="flex h-10 w-10 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-elevated hover:text-primary"
    >
      {children}
    </a>
  );
}
