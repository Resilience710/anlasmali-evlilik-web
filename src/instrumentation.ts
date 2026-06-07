import * as Sentry from "@sentry/nextjs";

// Sunucu + edge runtime hata izleme.
// DSN yoksa devre dışıdır (hiçbir şey göndermez) — güvenli, kurulumu bozmaz.
export function register() {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,
    tracesSampleRate: 0.1,
    sendDefaultPii: false, // KVKK: kişisel veri gönderme
  });
}

export const onRequestError = Sentry.captureRequestError;
