import Link from "next/link";
import { ShieldCheck, ArrowLeft } from "lucide-react";
import { requireAdmin } from "@/lib/auth-guards";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { signOutAction } from "@/app/_actions/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4 sm:px-6">
          <Link href="/admin" className="flex items-center gap-2 font-semibold">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-soft text-primary">
              <ShieldCheck className="size-5" />
            </span>
            Yönetim Paneli
          </Link>
          <div className="flex-1" />
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm text-muted-foreground hover:bg-elevated"
          >
            <ArrowLeft className="size-4" />
            Siteye Dön
          </Link>
          <form action={signOutAction}>
            <button
              type="submit"
              className="rounded-lg border border-border px-3 py-1.5 text-sm text-destructive hover:bg-elevated cursor-pointer"
            >
              Çıkış
            </button>
          </form>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6">
        <div className="grid gap-5 lg:grid-cols-[230px_1fr]">
          <aside className="lg:sticky lg:top-20 lg:self-start">
            <AdminSidebar />
          </aside>
          <div className="min-w-0">{children}</div>
        </div>
      </main>
    </div>
  );
}
