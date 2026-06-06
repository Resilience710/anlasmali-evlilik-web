import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Sora } from "next/font/google";
import { Toaster } from "sonner";
import NextTopLoader from "nextjs-toploader";
import "./globals.css";
import { getSiteSettings } from "@/lib/site";
import { PresenceBeacon } from "@/components/presence-beacon";
import { ConsentBanner } from "@/components/consent-banner";

const sans = Plus_Jakarta_Sans({
  variable: "--font-geist-sans",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const display = Sora({
  variable: "--font-display",
  subsets: ["latin", "latin-ext"],
  weight: ["600", "700", "800"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSiteSettings();
  return {
    title: {
      default: `${s.siteName} — ${s.tagline}`,
      template: `%s | ${s.siteName}`,
    },
    description: s.heroSubtitle ?? s.tagline,
  };
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="tr"
      className={`${sans.variable} ${display.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col overflow-x-hidden bg-background text-foreground">
        <NextTopLoader
          color="#f97316"
          height={3}
          shadow="0 0 10px #f97316,0 0 5px #f97316"
          showSpinner={false}
        />
        {children}
        <ConsentBanner />
        <PresenceBeacon />
        <Toaster
          theme="dark"
          position="top-right"
          toastOptions={{
            style: {
              background: "var(--color-elevated)",
              border: "1px solid var(--color-border)",
              color: "var(--color-foreground)",
            },
          }}
        />
      </body>
    </html>
  );
}
