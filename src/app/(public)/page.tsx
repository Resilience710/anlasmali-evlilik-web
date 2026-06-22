import type { Metadata } from "next";
import { auth } from "@/auth";
import { redirectIfBanned } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { getSiteSettings } from "@/lib/site";
import { getSiteStats } from "@/lib/stats";
import { getRecentListings, getCatalog } from "@/lib/listings";
import { getUnreadMessageTotal } from "@/lib/conversations";
import { getUnreadNotificationCount } from "@/lib/notifications";
import { Hero } from "@/components/home/hero";
import { OnlineCard } from "@/components/home/online-card";
import { FeatureCards } from "@/components/home/feature-cards";
import { RecentListings } from "@/components/home/recent-listings";
import { HowItWorks } from "@/components/home/how-it-works";
import { InlineListingWizard } from "@/components/home/inline-listing-wizard";
import { AccountPanel } from "@/components/home/account-panel";
import { JsonLd } from "@/components/seo/json-ld";
import { absoluteUrl, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Anlaşmalı Evlilik Platformu ve İlanları",
  description:
    "Anlaşmalı evlilik ve güvenilir evlilik ilanları için Türkiye geneli yetişkin üyelerle tanışın. Ücretsiz üyelik, onaylı ilanlar ve güvenli mesajlaşma.",
  path: "/",
  keywords: [
    "anlaşmalı evlilik ilanları",
    "evlilik düşünenler",
    "güvenilir tanışma sitesi",
    "hayat arkadaşı arıyorum",
  ],
});

export default async function HomePage() {
  await redirectIfBanned();
  const session = await auth();
  const userId = session?.user?.id;

  const [settings, stats, recent, catalog] = await Promise.all([
    getSiteSettings(),
    getSiteStats(),
    getRecentListings(10),
    getCatalog(),
  ]);

  let accountUser: { id: string; name: string; avatarUrl?: string | null } | null =
    null;
  let unreadMessages = 0;
  let unreadNotifications = 0;

  if (userId) {
    const [profile, m, n] = await Promise.all([
      prisma.profile.findUnique({
        where: { userId },
        select: { displayName: true, avatarUrl: true },
      }),
      getUnreadMessageTotal(userId),
      getUnreadNotificationCount(userId),
    ]);
    accountUser = {
      id: userId,
      name: profile?.displayName ?? "Üye",
      avatarUrl: profile?.avatarUrl,
    };
    unreadMessages = m;
    unreadNotifications = n;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Anlaşmalı Evlilik Platformu ve İlanları",
          description:
            "Anlaşmalı evlilik ve güvenilir evlilik ilanları için Türkiye geneli yetişkin üyelerle tanışma platformu.",
          url: absoluteUrl("/"),
          inLanguage: "tr-TR",
          isPartOf: { "@id": absoluteUrl("/#website") },
        }}
      />
      {recent.length > 0 && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "Son eklenen evlilik ilanları",
            itemListElement: recent.map((listing, index) => ({
              "@type": "ListItem",
              position: index + 1,
              url: absoluteUrl(`/ilanlar/${listing.slug}`),
              name: listing.title,
            })),
          }}
        />
      )}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[2.4fr_1fr]">
        {/* Sol ana sütun: hero görseli + son ilanlar */}
        <div className="flex min-w-0 flex-col gap-5">
          <Hero
            title={settings.heroTitle}
            subtitle={settings.heroSubtitle ?? settings.tagline}
            imageUrl={settings.heroImageUrl}
          />
          <RecentListings listings={recent} />
        </div>

        {/* Sağ tek sütun: Hesabım -> Online -> İlan Oluştur -> Nasıl Çalışır */}
        <div className="flex min-w-0 flex-col gap-5">
          <AccountPanel
            user={accountUser}
            unreadMessages={unreadMessages}
            unreadNotifications={unreadNotifications}
          />
          <OnlineCard online={stats.online} />
          <InlineListingWizard
            categories={catalog.categories.map((c) => ({
              id: c.id,
              name: c.name,
            }))}
            cities={catalog.cities.map((c) => ({ id: c.id, name: c.name }))}
            isLoggedIn={!!userId}
          />
          <HowItWorks />
        </div>
      </div>

      {/* Güvenli ortam / güven kartları — sayfanın en altında */}
      <div className="mt-10 border-t border-border pt-8">
        <FeatureCards />
      </div>
    </div>
  );
}
