import type { Metadata } from "next";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
  "https://anlasmalievlilik.net";

export const SITE_NAME = "anlaşmalievlilik.net";

export const DEFAULT_SEO_TITLE =
  "Anlaşmalı Evlilik ve Ciddi Evlilik Sitesi";

export const DEFAULT_SEO_DESCRIPTION =
  "Ciddi ilişki ve evlilik düşünen yetişkin üyeler için güvenli, gizlilik odaklı anlaşmalı evlilik ve evlilik ilanları platformu.";

export const SEO_KEYWORDS = [
  "anlaşmalı evlilik",
  "anlaşmalı evlilik sitesi",
  "ciddi evlilik sitesi",
  "evlilik sitesi",
  "güvenilir evlilik sitesi",
  "evlilik ilanları",
  "ciddi ilişki",
  "hayat arkadaşı bul",
  "evlenmek isteyenler",
  "Türkiye evlilik sitesi",
  "ücretsiz evlilik sitesi",
  "gerçek profiller",
  "güvenli tanışma",
  "bay arıyor",
  "bayan arıyor",
];

export function absoluteUrl(path = "/") {
  return new URL(path, SITE_URL).toString();
}

export function truncateMeta(value: string, maxLength = 155) {
  const text = value.replace(/\s+/g, " ").trim();
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1).trimEnd()}…`;
}

export function pageMetadata({
  title,
  description = DEFAULT_SEO_DESCRIPTION,
  path = "/",
  keywords = [],
  noIndex = false,
}: {
  title: string;
  description?: string;
  path?: string;
  keywords?: string[];
  noIndex?: boolean;
}): Metadata {
  const metaDescription = truncateMeta(description);

  return {
    title,
    description: metaDescription,
    keywords: [...SEO_KEYWORDS, ...keywords],
    alternates: { canonical: path },
    openGraph: {
      title,
      description: metaDescription,
      url: path,
      siteName: SITE_NAME,
      locale: "tr_TR",
      type: "website",
      images: [
        {
          url: "/opengraph-image",
          width: 1200,
          height: 630,
          alt: `${SITE_NAME} ciddi evlilik platformu`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: metaDescription,
      images: ["/opengraph-image"],
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
          googleBot: {
            index: false,
            follow: false,
            noimageindex: true,
          },
        }
      : {
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
  };
}

