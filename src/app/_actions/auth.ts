"use server";

import { AuthError } from "next-auth";
import bcrypt from "bcryptjs";
import { signIn, signOut, auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { registerSchema, changePasswordSchema } from "@/lib/validations";

export type ActionState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  success?: string;
  // Hata olunca girilen değerleri geri yollar (parola hariç) -> form temizlenmez.
  values?: Record<string, string>;
};

export async function registerAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const raw = {
    displayName: formData.get("displayName"),
    username: formData.get("username"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    cityId: formData.get("cityId"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    gender: formData.get("gender"),
    acceptTerms: formData.get("acceptTerms") === "on",
  };

  // Parola dışı alanları koru (hata sonrası form temizlenmesin)
  const keepValues = {
    displayName: String(formData.get("displayName") ?? ""),
    username: String(formData.get("username") ?? ""),
    email: String(formData.get("email") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    cityId: String(formData.get("cityId") ?? ""),
    gender: String(formData.get("gender") ?? ""),
    acceptTerms: formData.get("acceptTerms") === "on" ? "on" : "",
  };

  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors,
      values: keepValues,
    };
  }

  const email = parsed.data.email.toLowerCase().trim();
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) {
    return { error: "Bu e-posta zaten kayıtlı." };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  await prisma.user.create({
    data: {
      email,
      passwordHash,
      role: "USER",
      lastSeenAt: new Date(),
      profile: {
        create: {
          displayName: parsed.data.displayName,
          username: parsed.data.username,
          phone: parsed.data.phone,
          cityId: parsed.data.cityId,
          gender: parsed.data.gender,
        },
      },
    },
  });

  try {
    await signIn("credentials", {
      email,
      password: parsed.data.password,
      redirectTo: "/hesabim",
    });
  } catch (e) {
    if (e instanceof AuthError) {
      return { error: "Kayıt başarılı ancak giriş yapılamadı. Giriş yapın." };
    }
    throw e; // redirect
  }
  return {};
}

export async function loginAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const callbackUrl = String(formData.get("callbackUrl") ?? "/hesabim");

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: callbackUrl || "/hesabim",
    });
  } catch (e) {
    if (e instanceof AuthError) {
      return { error: "E-posta veya parola hatalı." };
    }
    throw e; // redirect
  }
  return {};
}

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}

export async function forgotPasswordAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const email = String(formData.get("email") ?? "").toLowerCase().trim();
  if (!email) return { error: "E-posta gerekli." };

  const user = await prisma.user.findUnique({ where: { email } });
  // Kullanıcı sayımını ele vermemek için her durumda başarı döndürürüz.
  if (user && !user.deletedAt) {
    const token = crypto.randomUUID().replace(/-/g, "");
    const expires = new Date(Date.now() + 60 * 60 * 1000);
    await prisma.verificationToken.create({
      data: { identifier: email, token, expires },
    });
    const link = `/sifre-sifirla/${token}`;
    // Üretimde burada e-posta gönderilir. Geliştirmede bağlantıyı gösteriyoruz.
    return {
      success:
        "Eğer bu e-posta kayıtlıysa sıfırlama bağlantısı gönderildi. (Geliştirme: " +
        link +
        ")",
    };
  }
  return {
    success: "Eğer bu e-posta kayıtlıysa sıfırlama bağlantısı gönderildi.",
  };
}

export async function resetPasswordAction(
  token: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");
  if (newPassword.length < 8) return { error: "Parola en az 8 karakter olmalı." };
  if (newPassword !== confirmPassword) return { error: "Parolalar eşleşmiyor." };

  const vt = await prisma.verificationToken.findUnique({ where: { token } });
  if (!vt || vt.expires < new Date()) {
    return { error: "Bağlantı geçersiz veya süresi dolmuş." };
  }

  const user = await prisma.user.findUnique({ where: { email: vt.identifier } });
  if (!user) return { error: "Kullanıcı bulunamadı." };

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash },
  });
  await prisma.verificationToken.delete({ where: { token } }).catch(() => {});

  return { success: "Parolanız güncellendi. Artık giriş yapabilirsiniz." };
}

export async function changePasswordAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Oturum bulunamadı." };

  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });
  if (!user?.passwordHash) return { error: "Kullanıcı bulunamadı." };

  const ok = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash);
  if (!ok) return { error: "Mevcut parola hatalı." };

  const newHash = await bcrypt.hash(parsed.data.newPassword, 12);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: newHash },
  });

  return { success: "Parolanız güncellendi." };
}
