"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { ShieldCheck, X } from "lucide-react";

const KEY = "ae-consent-v1";
const emptySubscribe = () => () => {};

export function ConsentBanner() {
  // localStorage'ı effect içinde senkron setState yapmadan okur (SSR güvenli).
  const dismissed = useSyncExternalStore(
    emptySubscribe,
    () => {
      try {
        return !!localStorage.getItem(KEY);
      } catch {
        return true;
      }
    },
    () => true // Sunucuda gösterme
  );
  const [hidden, setHidden] = useState(false);

  if (dismissed || hidden) return null;

  const accept = () => {
    try {
      localStorage.setItem(KEY, new Date().toISOString());
    } catch {}
    setHidden(true);
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 p-2.5 sm:p-3">
      <div className="mx-auto flex max-w-2xl flex-col gap-2.5 rounded-xl border border-border bg-elevated/95 p-3 shadow-pop backdrop-blur sm:flex-row sm:items-center sm:gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
          <ShieldCheck className="size-4" />
        </span>
        <p className="flex-1 text-xs leading-relaxed text-foreground/80">
          Bilgileriniz yalnızca hizmeti sunmak için ve{" "}
          <Link href="/gizlilik-politikasi" className="text-primary hover:underline">
            Gizlilik Politikası
          </Link>{" "}
          kapsamında işlenir; pazarlama amacıyla paylaşılmaz.
        </p>
        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={accept}
            className="rounded-lg bg-primary px-3.5 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover cursor-pointer"
          >
            Kabul Et
          </button>
          <button
            onClick={accept}
            aria-label="Kapat"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-surface cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
