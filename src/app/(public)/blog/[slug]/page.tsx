import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock } from "lucide-react";
import { getBlogPost, getBlogPosts, readingMinutes } from "@/lib/blog";
import { redirectIfBanned } from "@/lib/auth-guards";
import { Markdown } from "@/components/blog/markdown";
import { JsonLd } from "@/components/seo/json-ld";
import { absoluteUrl, pageMetadata, SITE_NAME } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  if (!post) {
    return pageMetadata({ title: "Yazı bulunamadı", path: `/blog/${slug}`, noIndex: true });
  }
  return pageMetadata({
    title: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt || post.title,
    path: `/blog/${post.slug}`,
    keywords: post.keyword ? [post.keyword] : [],
  });
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await redirectIfBanned();
  const { slug } = await params;
  const post = await getBlogPost(slug);
  if (!post) notFound();

  const all = await getBlogPosts();
  const related = all.filter((p) => p.slug !== post.slug).slice(0, 4);
  const minutes = readingMinutes(post.content);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: post.title,
          description: post.metaDescription || post.excerpt || undefined,
          datePublished: post.publishedAt.toISOString(),
          dateModified: post.updatedAt.toISOString(),
          inLanguage: "tr-TR",
          mainEntityOfPage: absoluteUrl(`/blog/${post.slug}`),
          keywords: post.keyword || undefined,
          author: { "@type": "Organization", name: SITE_NAME },
          publisher: { "@type": "Organization", name: SITE_NAME },
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Ana Sayfa", item: absoluteUrl("/") },
            { "@type": "ListItem", position: 2, name: "Blog", item: absoluteUrl("/blog") },
            {
              "@type": "ListItem",
              position: 3,
              name: post.title,
              item: absoluteUrl(`/blog/${post.slug}`),
            },
          ],
        }}
      />

      <Link
        href="/blog"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Tüm yazılar
      </Link>

      <article className="mt-4">
        <h1 className="text-2xl font-bold leading-tight sm:text-3xl">
          {post.title}
        </h1>
        <div className="mt-3 flex items-center gap-3 text-sm text-muted-foreground">
          <span>{post.publishedAt.toLocaleDateString("tr-TR")}</span>
          <span className="inline-flex items-center gap-1">
            <Clock className="size-3.5" />
            {minutes} dk okuma
          </span>
        </div>

        <div className="mt-6 border-t border-border pt-2">
          <Markdown content={post.content} />
        </div>
      </article>

      {related.length > 0 && (
        <section className="mt-10 border-t border-border pt-6">
          <h2 className="mb-4 text-lg font-semibold">İlgili Yazılar</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {related.map((p) => (
              <Link
                key={p.id}
                href={`/blog/${p.slug}`}
                className="rounded-[var(--radius-card)] border border-border bg-surface p-4 text-sm font-medium transition-colors hover:border-primary/40 hover:text-primary"
              >
                {p.title}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
