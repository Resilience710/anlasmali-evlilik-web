import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireAdmin } from "@/lib/auth-guards";
import { BlogForm } from "@/components/admin/blog-form";

export const metadata: Metadata = { title: "Yeni Blog Yazısı — Yönetim" };

export default async function AdminBlogNewPage() {
  await requireAdmin();
  return (
    <div className="flex flex-col gap-5">
      <Link
        href="/admin/blog"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Blog yazıları
      </Link>
      <h1 className="text-2xl font-bold">Yeni Blog Yazısı</h1>
      <div className="rounded-[var(--radius-card)] border border-border bg-surface p-5">
        <BlogForm />
      </div>
    </div>
  );
}
