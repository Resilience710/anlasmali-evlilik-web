import { redirect } from "next/navigation";
import { auth } from "@/auth";

export async function getSession() {
  return auth();
}

export async function getCurrentUser() {
  const session = await auth();
  return session?.user?.id ? session.user : null;
}

export async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) redirect("/giris");
  return session.user;
}

export async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) redirect("/giris?callbackUrl=/admin");
  // Admin değilse 404 yerine ana sayfaya yönlendir (kafa karıştırmasın).
  if (session.user.role !== "ADMIN") redirect("/");
  return session.user;
}
