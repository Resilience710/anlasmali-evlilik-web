"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu } from "lucide-react";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import { SITE_NAV, ACCOUNT_NAV } from "@/lib/constants";
import { Separator } from "@/components/ui/separator";

export function MobileNav({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg border border-border text-foreground lg:hidden">
        <Menu className="size-5" />
        <span className="sr-only">Menü</span>
      </SheetTrigger>
      <SheetContent side="right" className="overflow-y-auto">
        <p className="text-sm font-semibold text-muted-foreground">Menü</p>
        <nav className="flex flex-col gap-1">
          {SITE_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-elevated"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        {isLoggedIn && (
          <>
            <Separator />
            <p className="text-sm font-semibold text-muted-foreground">
              Hesabım
            </p>
            <nav className="flex flex-col gap-1">
              {ACCOUNT_NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm hover:bg-elevated"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </>
        )}
        {!isLoggedIn && (
          <>
            <Separator />
            <div className="flex flex-col gap-2">
              <Link
                href="/giris"
                onClick={() => setOpen(false)}
                className="rounded-lg border border-border px-3 py-2.5 text-center text-sm font-medium"
              >
                Giriş Yap
              </Link>
              <Link
                href="/kayit"
                onClick={() => setOpen(false)}
                className="rounded-lg bg-primary px-3 py-2.5 text-center text-sm font-medium text-primary-foreground"
              >
                Üye Ol
              </Link>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
