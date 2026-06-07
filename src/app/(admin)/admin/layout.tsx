import Link from "next/link";
import { ShieldCheck, ArrowLeft, LogOut } from "lucide-react";
import { requireStaff } from "@/lib/auth-guards";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { signOutAction } from "@/app/_actions/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const staff = await requireStaff();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-2 px-4 sm:gap-3 sm:px-6">
          <Link href="/admin" className="flex min-w-0 items-center gap-2 font-semibold">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
              <ShieldCheck className="size-5" />
            </span>
            <span className="truncate">Yönetim Paneli</span>
          </Link>
          <div className="flex-1" />
          <Link
            href="/"
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border px-2.5 text-sm text-muted-foreground hover:bg-elevated sm:px-3"
          >
            <ArrowLeft className="size-4 shrink-0" />
            <span className="hidden sm:inline">Siteye Dön</span>
          </Link>
          <form action={signOutAction}>
            <button
              type="submit"
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border px-2.5 text-sm text-destructive hover:bg-elevated cursor-pointer sm:px-3"
            >
              <LogOut className="size-4 shrink-0" />
              <span className="hidden sm:inline">Çıkış</span>
            </button>
          </form>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6">
        <div className="grid gap-5 lg:grid-cols-[230px_1fr]">
          <aside className="lg:sticky lg:top-20 lg:self-start">
            <AdminSidebar role={staff.role} />
          </aside>
          <div className="min-w-0">{children}</div>
        </div>
      </main>
    </div>
  );
}
