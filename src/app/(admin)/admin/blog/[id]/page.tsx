import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guards";
import { BlogForm } from "@/components/admin/blog-form";

export const metadata: Metadata = { title: "Blog Yazısını Düzenle — Yönetim" };

export default async function AdminBlogEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const post = await prisma.blogPost.findUnique({ where: { id } });
  if (!post) notFound();

  return (
    <div className="flex flex-col gap-5">
      <Link
        href="/admin/blog"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Blog yazıları
      </Link>
      <h1 className="text-2xl font-bold">Blog Yazısını Düzenle</h1>
      <div className="rounded-[var(--radius-card)] border border-border bg-surface p-5">
        <BlogForm post={post} />
      </div>
    </div>
  );
}
