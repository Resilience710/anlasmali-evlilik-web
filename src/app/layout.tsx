import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Sora } from "next/font/google";
import { Toaster } from "sonner";
import NextTopLoader from "nextjs-toploader";
import "./globals.css";
import { getSiteSettings } from "@/lib/site";
import { PresenceBeacon } from "@/components/presence-beacon";
import { ConsentBanner } from "@/components/consent-banner";
import { JsonLd } from "@/components/seo/json-ld";
import {
  absoluteUrl,
  DEFAULT_SEO_DESCRIPTION,
  DEFAULT_SEO_TITLE,
  SEO_KEYWORDS,
  SITE_NAME,
  SITE_URL,
} from "@/lib/seo";

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
    metadataBase: new URL(SITE_URL),
    title: {
      default: DEFAULT_SEO_TITLE,
      template: `%s | ${s.siteName}`,
    },
    description: DEFAULT_SEO_DESCRIPTION,
    applicationName: s.siteName,
    authors: [{ name: s.siteName, url: SITE_URL }],
    creator: s.siteName,
    publisher: s.siteName,
    keywords: SEO_KEYWORDS,
    category: "Evlilik ve ciddi ilişki platformu",
    alternates: {
      canonical: "/",
      languages: {
        "tr-TR": "/",
      },
    },
    openGraph: {
      title: DEFAULT_SEO_TITLE,
      description: DEFAULT_SEO_DESCRIPTION,
      url: "/",
      siteName: s.siteName,
      locale: "tr_TR",
      type: "website",
      images: [
        {
          url: "/opengraph-image",
          width: 1200,
          height: 630,
          alt: `${s.siteName} ciddi evlilik platformu`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: DEFAULT_SEO_TITLE,
      description: DEFAULT_SEO_DESCRIPTION,
      images: ["/opengraph-image"],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-snippet": -1,
        "max-image-preview": "large",
        "max-video-preview": -1,
      },
    },
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
  };
}

export const viewport = {
  themeColor: "#0a0a0b",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const s = await getSiteSettings();
  const sameAs = [
    s.social.facebook,
    s.social.instagram,
    s.social.x,
    s.social.youtube,
  ].filter(Boolean) as string[];

  return (
    <html
      lang="tr"
      className={`${sans.variable} ${display.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col overflow-x-hidden bg-background text-foreground">
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "Organization",
                "@id": absoluteUrl("/#organization"),
                name: SITE_NAME,
                url: absoluteUrl("/"),
                logo: absoluteUrl("/opengraph-image"),
                description: DEFAULT_SEO_DESCRIPTION,
                slogan: s.tagline,
                ...(sameAs.length ? { sameAs } : {}),
                ...(s.contactEmail
                  ? {
                      contactPoint: {
                        "@type": "ContactPoint",
                        email: s.contactEmail,
                        contactType: "customer support",
                        areaServed: "TR",
                        availableLanguage: "Turkish",
                      },
                    }
                  : {}),
              },
              {
                "@type": "WebSite",
                "@id": absoluteUrl("/#website"),
                name: SITE_NAME,
                url: absoluteUrl("/"),
                inLanguage: "tr-TR",
                publisher: { "@id": absoluteUrl("/#organization") },
                potentialAction: {
                  "@type": "SearchAction",
                  target: `${absoluteUrl("/ilanlar")}?q={search_term_string}`,
                  "query-input": "required name=search_term_string",
                },
              },
            ],
          }}
        />
        <NextTopLoader
          color="#ffd700"
          height={3}
          shadow="0 0 10px #ffd700,0 0 5px #ffd700"
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
