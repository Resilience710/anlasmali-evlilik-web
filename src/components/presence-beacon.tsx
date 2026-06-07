"use client";

import { useEffect } from "react";

/**
 * Giriş yapmış kullanıcıların "online" sayılması için periyodik sinyal gönderir.
 * Misafirlerde sunucu tarafı no-op olur.
 */
export function PresenceBeacon() {
  useEffect(() => {
    const ping = () => {
      fetch("/api/presence", { method: "POST", keepalive: true }).catch(
        () => {}
      );
    };
    ping();
    // Yalnız sekme görünürken sinyal gönder (arka plan sekmeleri yük oluşturmasın)
    const interval = setInterval(() => {
      if (!document.hidden) ping();
    }, 60_000);
    const onVisible = () => {
      if (document.visibilityState === "visible") ping();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  return null;
}
