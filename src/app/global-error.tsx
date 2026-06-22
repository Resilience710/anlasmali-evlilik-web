"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

// Kök seviye render hatalarını yakalar ve Sentry'ye raporlar.
export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="tr">
      <body
        style={{
          display: "flex",
          minHeight: "100vh",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
          background: "#0a0a0b",
          color: "#fafafa",
          fontFamily: "system-ui, sans-serif",
          textAlign: "center",
          padding: "1rem",
        }}
      >
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700 }}>
          Bir şeyler ters gitti
        </h1>
        <p style={{ color: "#a6a6ae" }}>
          Beklenmeyen bir hata oluştu. Lütfen sayfayı yenileyin.
        </p>
        <button
          type="button"
          onClick={() => {
            window.location.href = "/";
          }}
          style={{
            borderRadius: "0.5rem",
            background: "#ffd700",
            padding: "0.6rem 1.2rem",
            color: "#0a0a0b",
            fontWeight: 600,
            border: "none",
            cursor: "pointer",
          }}
        >
          Ana sayfaya dön
        </button>
      </body>
    </html>
  );
}
