import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/auth.config";

const { auth } = NextAuth(authConfig);

// Bazı reverse proxy katmanları (OpenLiteSpeed/HTTP-3 vb.) Origin ve
// X-Forwarded-* başlıklarını çiftleyebiliyor: "https://site, https://site".
// Next.js Server Action origin kontrolü bu değeri URL olarak parse ederken
// ERR_INVALID_URL fırlatır ve tüm form gönderimi patlar. Burada çiftlenen
// başlıkları ilk değere indirerek normalize ediyoruz.
const HEADERS_TO_DEDUPE = [
  "origin",
  "x-forwarded-host",
  "x-forwarded-proto",
  "x-forwarded-for",
];

export default auth((req) => {
  let changed = false;
  const headers = new Headers(req.headers);
  for (const name of HEADERS_TO_DEDUPE) {
    const value = req.headers.get(name);
    if (value && value.includes(",")) {
      headers.set(name, value.split(",")[0].trim());
      changed = true;
    }
  }
  if (changed) {
    return NextResponse.next({ request: { headers } });
  }
});

export const config = {
  // Tüm sayfalar + API (server action'lar sayfa URL'sine POST edilir).
  // api/auth hariç (Auth.js kendi route'larını yönetir), statikler hariç.
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|icon.png|app-ads.txt|ads.txt|uploads/).*)",
  ],
};
