import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { absoluteUrl } from "@/lib/seo";

export const revalidate = 3600;

function imageUrl(src: string | null) {
  if (!src) return undefined;
  return src.startsWith("http") ? src : absoluteUrl(src);
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), lastModified: now, changeFrequency: "daily", priority: 1 },
    {
      url: absoluteUrl("/ilanlar"),
      lastModified: now,
      changeFrequency: "hourly",
      priority: 0.95,
    },
    {
      url: absoluteUrl("/uyeler"),
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.75,
    },
    {
      url: absoluteUrl("/hakkimizda"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: absoluteUrl("/yasal-prosedur"),
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.4,
    },
    {
      url: absoluteUrl("/blog"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: absoluteUrl("/sss"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.65,
    },
    {
      url: absoluteUrl("/yardim"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.55,
    },
    {
      url: absoluteUrl("/iletisim"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: absoluteUrl("/kullanim-sartlari"),
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.35,
    },
    {
      url: absoluteUrl("/privacy"),
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: absoluteUrl("/gizlilik-politikasi"),
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.35,
    },
    {
      url: absoluteUrl("/sorumluluk-reddi"),
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.35,
    },
  ];

  const [listings, members, blogPosts] = await Promise.all([
    prisma.listing.findMany({
      where: { status: "APPROVED", deletedAt: null },
      orderBy: { publishedAt: "desc" },
      select: {
        slug: true,
        updatedAt: true,
        publishedAt: true,
        imageUrl: true,
      },
      take: 5000,
    }),
    prisma.user.findMany({
      where: {
        role: "USER",
        deletedAt: null,
        isBanned: false,
        profile: { isNot: null },
      },
      orderBy: { updatedAt: "desc" },
      select: { id: true, updatedAt: true },
      take: 5000,
    }),
    prisma.blogPost.findMany({
      where: { published: true },
      orderBy: { publishedAt: "desc" },
      select: { slug: true, updatedAt: true, publishedAt: true },
      take: 5000,
    }),
  ]);

  const listingRoutes: MetadataRoute.Sitemap = listings.map((listing) => {
    const image = imageUrl(listing.imageUrl);
    return {
      url: absoluteUrl(`/ilanlar/${listing.slug}`),
      lastModified: listing.updatedAt ?? listing.publishedAt ?? now,
      changeFrequency: "weekly",
      priority: 0.85,
      ...(image ? { images: [image] } : {}),
    };
  });

  const memberRoutes: MetadataRoute.Sitemap = members.map((member) => ({
    url: absoluteUrl(`/uyeler/${member.id}`),
    lastModified: member.updatedAt ?? now,
    changeFrequency: "weekly",
    priority: 0.55,
  }));

  const blogRoutes: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: absoluteUrl(`/blog/${post.slug}`),
    lastModified: post.updatedAt ?? post.publishedAt ?? now,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...listingRoutes, ...memberRoutes, ...blogRoutes];
}

