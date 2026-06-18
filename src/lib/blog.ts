import { cache } from "react";
import { prisma } from "@/lib/prisma";

export type BlogListItem = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  coverImageUrl: string | null;
  publishedAt: Date;
};

/** Yayında olan blog yazıları (liste). */
export const getBlogPosts = cache(async (): Promise<BlogListItem[]> => {
  return prisma.blogPost.findMany({
    where: { published: true },
    orderBy: [{ order: "asc" }, { publishedAt: "desc" }],
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      coverImageUrl: true,
      publishedAt: true,
    },
  });
});

/** Tek blog yazısı (slug). Yayında değilse null. */
export const getBlogPost = cache(async (slug: string) => {
  const post = await prisma.blogPost.findUnique({ where: { slug } });
  if (!post || !post.published) return null;
  return post;
});

/** Tahmini okuma süresi (dk). */
export function readingMinutes(content: string): number {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}
