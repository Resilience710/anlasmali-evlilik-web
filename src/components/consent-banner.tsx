"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShieldCheck, X } from "lucide-react";

const KEY = "ae-consent-v1";

export function ConsentBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) setShow(true);
    } catch {
      /* localStorage yoksa gösterme */
    }
  }, []);

  if (!show) return null;

  const accept = () => {
    try {
      localStorage.setItem(KEY, new Date().toISOString());
    } catch {}
    setShow(false);
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-3 sm:p-4">
      <div className="mx-auto flex max-w-4xl flex-col gap-3 rounded-2xl border border-border bg-elevated/95 p-4 shadow-2xl backdrop-blur sm:flex-row sm:items-center">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
          <ShieldCheck className="size-5" />
        </span>
        <p className="flex-1 text-sm leading-relaxed text-foreground/90">
          Gizliliğiniz bizim için önemli. Bilgileriniz yalnızca hizmeti sunmak
          amacıyla ve{" "}
          <Link href="/gizlilik-politikasi" className="text-primary hover:underline">
            Gizlilik Politikası
          </Link>{" "}
          kapsamında işlenir; üçüncü kişilerle pazarlama amacıyla paylaşılmaz.
          Devam ederek bunu kabul etmiş olursunuz.
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={accept}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover cursor-pointer"
          >
            Kabul Et
          </button>
          <button
            onClick={accept}
            aria-label="Kapat"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-surface cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
