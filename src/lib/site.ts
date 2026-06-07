import { cache } from "react";
import { prisma } from "@/lib/prisma";

export type SocialLinks = {
  facebook?: string;
  instagram?: string;
  x?: string;
  youtube?: string;
};

export type FaqItem = { q: string; a: string };

const DEFAULTS = {
  siteName: "anlaşmalievlilik.com",
  tagline: "Ciddi İlişki, Mutlu Evlilik",
  heroTitle: "Hayat Arkadaşınızı AnlaşmalıEvlilik.com'da Bulun",
  heroSubtitle:
    "Ciddi düşünen, geleceğe birlikte yürümek isteyen insanları bir araya getiriyoruz.",
};

export const getSiteSettings = cache(async () => {
  const s = await prisma.siteSetting.findUnique({ where: { id: "singleton" } });
  if (!s) {
    return {
      id: "singleton",
      ...DEFAULTS,
      logoUrl: null as string | null,
      aboutText: null as string | null,
      contactEmail: null as string | null,
      contactPhone: null as string | null,
      contactText: null as string | null,
      termsText: null as string | null,
      privacyText: null as string | null,
      disclaimerText: null as string | null,
      happyCount: 0,
      social: {} as SocialLinks,
      faq: [] as FaqItem[],
    };
  }
  return {
    ...s,
    social: safeParse<SocialLinks>(s.socialJson, {}),
    faq: safeParse<FaqItem[]>(s.faqJson, []),
  };
});

function safeParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}
