import type { Metadata } from "next";
import { auth } from "@/auth";
import { redirectIfBanned } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { getSiteSettings } from "@/lib/site";
import { getSiteStats } from "@/lib/stats";
import {
  getRecentListings,
  getCategorySidebar,
  getCitySidebar,
  getCatalog,
} from "@/lib/listings";
import { getUnreadMessageTotal } from "@/lib/conversations";
import { getUnreadNotificationCount } from "@/lib/notifications";
import { Hero } from "@/components/home/hero";
import { OnlineCard } from "@/components/home/online-card";
import { FeatureCards } from "@/components/home/feature-cards";
import { StatsStrip } from "@/components/home/stats-strip";
import { RecentListings } from "@/components/home/recent-listings";
import { CategorySidebar } from "@/components/home/category-sidebar";
import { HowItWorks } from "@/components/home/how-it-works";
import { InlineListingWizard } from "@/components/home/inline-listing-wizard";
import { AccountPanel } from "@/components/home/account-panel";
import { JsonLd } from "@/components/seo/json-ld";
import { absoluteUrl, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Anlaşmalı Evlilik Sitesi ve Ciddi Evlilik İlanları",
  description:
    "Anlaşmalı evlilik, ciddi ilişki ve güvenilir evlilik ilanları için Türkiye geneli yetişkin üyelerle tanışın. Ücretsiz üyelik, onaylı ilanlar ve güvenli mesajlaşma.",
  path: "/",
  keywords: [
    "ciddi evlilik ilanları",
    "evlilik düşünenler",
    "güvenilir tanışma sitesi",
    "hayat arkadaşı arıyorum",
  ],
});

export default async function HomePage() {
  await redirectIfBanned();
  const session = await auth();
  const userId = session?.user?.id;

  const [settings, stats, recent, catSidebar, citySidebar, catalog] =
    await Promise.all([
      getSiteSettings(),
      getSiteStats(),
      getRecentListings(5),
      getCategorySidebar(),
      getCitySidebar(5),
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
          name: "Anlaşmalı Evlilik Sitesi ve Ciddi Evlilik İlanları",
          description:
            "Anlaşmalı evlilik, ciddi ilişki ve güvenilir evlilik ilanları için Türkiye geneli yetişkin üyelerle tanışma platformu.",
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
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[3fr_1fr_1fr]">
        {/* Sol ana sütun */}
        <div className="flex min-w-0 flex-col gap-5">
          <Hero
            title={settings.heroTitle}
            subtitle={settings.heroSubtitle ?? settings.tagline}
          />
          <FeatureCards />
          <StatsStrip
            totalUsers={stats.totalUsers}
            online={stats.online}
            totalListings={stats.totalListings}
            happyCount={stats.happyCount}
          />
          <RecentListings listings={recent} />
        </div>

        {/* Orta sütun */}
        <div className="flex min-w-0 flex-col gap-5">
          <OnlineCard online={stats.online} />
          <CategorySidebar
            total={catSidebar.total}
            categories={catSidebar.categories}
            cities={citySidebar}
          />
          <HowItWorks />
        </div>

        {/* Sağ sütun */}
        <div className="flex min-w-0 flex-col gap-5">
          <InlineListingWizard
            categories={catalog.categories.map((c) => ({
              id: c.id,
              name: c.name,
            }))}
            cities={catalog.cities.map((c) => ({ id: c.id, name: c.name }))}
            isLoggedIn={!!userId}
          />
          <AccountPanel
            user={accountUser}
            unreadMessages={unreadMessages}
            unreadNotifications={unreadNotifications}
          />
        </div>
      </div>

      <section className="mt-10 border-t border-border pt-8">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <h2 className="text-xl font-bold sm:text-2xl">
              Ciddi evlilik ve anlaşmalı evlilik ilanları
            </h2>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              AnlaşmalıEvlilik.net, evlilik niyetiyle tanışmak isteyen yetişkin
              üyeleri şehir, yaş, cinsiyet ve ilan kategorilerine göre bir araya
              getirir. Amaç; geçici sohbetlerden çok, beklentisini açıkça yazan
              kişilerle güvenli ve saygılı bir tanışma alanı oluşturmaktır.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            <div className="rounded-[var(--radius-card)] border border-border bg-surface p-4">
              <h3 className="font-semibold">Türkiye geneli arama</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                İstanbul, Ankara, İzmir, Bursa, Antalya ve tüm şehirlerde aktif
                evlilik ilanlarını filtreleyin.
              </p>
            </div>
            <div className="rounded-[var(--radius-card)] border border-border bg-surface p-4">
              <h3 className="font-semibold">Ciddi niyet odaklı</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                İlanlar; hayat arkadaşı, yuva kurma ve uzun vadeli ilişki
                beklentisini açıkça ifade eden üyeler içindir.
              </p>
            </div>
            <div className="rounded-[var(--radius-card)] border border-border bg-surface p-4">
              <h3 className="font-semibold">Gizlilik ve moderasyon</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Şikayet, engelleme, profil tamamlama ve yönetici kontrolleriyle
                daha kontrollü bir tanışma deneyimi sunulur.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
