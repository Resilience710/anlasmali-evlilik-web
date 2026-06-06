import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { authConfig } from "@/auth.config";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validations";
import { emailVerificationEnabled } from "@/lib/email";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "E-posta", type: "email" },
        password: { label: "Parola", type: "password" },
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
        };
      },
    }),
  ],
});
