import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function getSession() {
  return auth();
}

export async function getCurrentUser() {
  const session = await auth();
  return session?.user?.id ? session.user : null;
}

/**
 * Kullanıcı yasaklı (ban) ya da silinmiş mi? (DB'den anlık kontrol)
 * Oturum açıkken admin tarafından banlanan kullanıcıları da yakalar.
 */
export async function isUserBanned(userId: string): Promise<boolean> {
  const u = await prisma.user.findUnique({
    where: { id: userId },
    select: { isBanned: true, deletedAt: true },
  });
  return !u || u.isBanned || !!u.deletedAt;
}

export async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) redirect("/giris");
  if (await isUserBanned(session.user.id)) redirect("/hesap-askida");
  return session.user;
}

/** İçerik sayfalarında: giriş yapmış ama yasaklı kullanıcıyı askıya-alındı sayfasına yollar. */
export async function redirectIfBanned() {
  const session = await auth();
  if (session?.user?.id && (await isUserBanned(session.user.id))) {
    redirect("/hesap-askida");
  }
}

export async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) redirect("/giris?callbackUrl=/admin");
  // Admin değilse 404 yerine ana sayfaya yönlendir (kafa karıştırmasın).
  if (session.user.role !== "ADMIN") redirect("/");
  return session.user;
}
