import type { Metadata } from "next";
import Link from "next/link";
import { Plus, Pencil, ExternalLink } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guards";
import { Badge } from "@/components/ui/badge";
import { CatalogDeleteButton } from "@/components/admin/simple-action-buttons";

export const metadata: Metadata = { title: "Blog — Yönetim" };

export default async function AdminBlogPage() {
  await requireAdmin();
  const posts = await prisma.blogPost.findMany({
    orderBy: [{ order: "asc" }, { publishedAt: "desc" }],
  });

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Blog Yazıları</h1>
        <Link
          href="/admin/blog/yeni"
          className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground"
        >
          <Plus className="size-4" />
          Yeni Yazı
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="rounded-[var(--radius-card)] border border-border bg-surface p-10 text-center text-muted-foreground">
          Henüz blog yazısı yok. “Yeni Yazı” ile ekleyin.
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {posts.map((p) => (
            <div
              key={p.id}
              className="flex flex-col gap-3 rounded-[var(--radius-card)] border border-border bg-surface p-4 sm:flex-row sm:items-center"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="truncate font-medium">{p.title}</span>
                  {p.published ? (
                    <Badge variant="success">Yayında</Badge>
                  ) : (
                    <Badge variant="neutral">Taslak</Badge>
                  )}
                </div>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  /blog/{p.slug} · sıra {p.order}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Link
                  href={`/blog/${p.slug}`}
                  target="_blank"
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border px-3 text-sm text-muted-foreground hover:bg-elevated"
                >
                  <ExternalLink className="size-4" />
                  Görüntüle
                </Link>
                <Link
                  href={`/admin/blog/${p.id}`}
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border px-3 text-sm hover:bg-elevated"
                >
                  <Pencil className="size-4" />
                  Düzenle
                </Link>
                <CatalogDeleteButton kind="blogPost" id={p.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
