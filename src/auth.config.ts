import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe yapılandırma (Prisma / bcrypt YOK).
 * middleware.ts bunu kullanır; tam yapılandırma auth.ts içinde.
 */
export const authConfig = {
  trustHost: true,
  pages: {
    signIn: "/giris",
  },
  session: { strategy: "jwt" },
  providers: [], // auth.ts içinde doldurulur
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = user.role ?? "USER";
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) ?? token.sub ?? "";
        session.user.role = (token.role as string) ?? "USER";
      }
      return session;
    },
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const isLoggedIn = !!auth?.user;
      // matcher yalnız korumalı yolları kapsar; giriş yeterli.
      // Admin rol kontrolü ayrıca admin layout'unda (requireAdmin) yapılır.
      if (pathname.startsWith("/hesabim") || pathname.startsWith("/admin")) {
        return isLoggedIn;
      }
      return true;
    },
  },
} satisfies NextAuthConfig;
