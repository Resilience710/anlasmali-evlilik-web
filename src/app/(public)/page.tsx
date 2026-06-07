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
    </div>
  );
}
