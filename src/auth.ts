import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { encode as defaultEncode } from "next-auth/jwt";
import bcrypt from "bcryptjs";
import { authConfig } from "@/auth.config";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validations";
import { emailVerificationEnabled } from "@/lib/email";

const REMEMBER_MAX_AGE = 30 * 24 * 60 * 60; // 30 gün
const SHORT_MAX_AGE = 24 * 60 * 60; // 1 gün

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  // "Beni hatırla" işaretsizse JWT süresini kısalt (varsayılan davranış değişmez).
  jwt: {
    encode: (params) => {
      const remember = (params.token as { remember?: boolean } | undefined)
        ?.remember;
      return defaultEncode({
        ...params,
        maxAge: remember === false ? SHORT_MAX_AGE : REMEMBER_MAX_AGE,
      });
    },
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "E-posta", type: "email" },
        password: { label: "Parola", type: "password" },
        remember: { label: "Beni hatırla", type: "text" },
      },
      authorize: async (credentials) => {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const email = parsed.data.email.toLowerCase().trim();
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.passwordHash || user.isBanned || user.deletedAt) {
          return null;
        }

        const valid = await bcrypt.compare(
          parsed.data.password,
          user.passwordHash
        );
        if (!valid) return null;

        // E-posta doğrulama açıksa, doğrulanmamış hesapla giriş engellenir
        if (emailVerificationEnabled() && !user.emailVerified) return null;

        // Son görülme zamanını güncelle (online göstergesi için)
        await prisma.user
          .update({ where: { id: user.id }, data: { lastSeenAt: new Date() } })
          .catch(() => {});

        return {
          id: user.id,
          email: user.email,
          name: email.split("@")[0],
          role: user.role,
          remember: credentials?.remember !== "0",
        };
      },
    }),
  ],
});
