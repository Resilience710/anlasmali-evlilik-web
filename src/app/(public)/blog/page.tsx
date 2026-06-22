import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Newspaper } from "lucide-react";
import { getBlogPosts } from "@/lib/blog";
import { redirectIfBanned } from "@/lib/auth-guards";
import { JsonLd } from "@/components/seo/json-ld";
import { absoluteUrl, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Blog — Anlaşmalı Evlilik Rehberi",
  description:
    "Anlaşmalı evlilik, sözleşmeli evlilik, tayin için evlilik ve güvenli partner bulma hakkında rehber yazılar.",
  path: "/blog",
  keywords: [
    "anlaşmalı evlilik blog",
    "evlilik rehberi",
    "sözleşmeli evlilik",
    "mantık evliliği",
  ],
});

export default async function BlogIndexPage() {
  await redirectIfBanned();
  const posts = await getBlogPosts();

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Blog",
          name: "anlaşmalievlilik.net Blog",
          description:
            "Anlaşmalı evlilik üzerine rehber yazılar.",
          url: absoluteUrl("/blog"),
          inLanguage: "tr-TR",
          blogPost: posts.map((p) => ({
            "@type": "BlogPosting",
            headline: p.title,
            url: absoluteUrl(`/blog/${p.slug}`),
            datePublished: p.publishedAt.toISOString(),
          })),
        }}
      />

      <div className="mb-7 flex items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
          <Newspaper className="size-6" />
        </span>
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Blog</h1>
          <p className="text-sm text-muted-foreground">
            Anlaşmalı evlilik üzerine rehber yazılar.
          </p>
        </div>
      </div>

      {posts.length === 0 ? (
        <div className="rounded-[var(--radius-card)] border border-border bg-surface p-10 text-center text-muted-foreground">
          Henüz blog yazısı yok.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {posts.map((p) => (
            <Link
              key={p.id}
              href={`/blog/${p.slug}`}
              className="group flex flex-col rounded-[var(--radius-card)] border border-border bg-surface p-5 transition-colors hover:border-primary/40"
            >
              <h2 className="text-base font-semibold leading-snug text-foreground group-hover:text-primary sm:text-lg">
                {p.title}
              </h2>
              {p.excerpt && (
                <p className="mt-2 line-clamp-3 flex-1 text-sm text-muted-foreground">
                  {p.excerpt}
                </p>
              )}
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                Devamını oku
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
