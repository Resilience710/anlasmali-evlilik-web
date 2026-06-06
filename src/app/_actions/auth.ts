"use server";

import { AuthError } from "next-auth";
import { headers } from "next/headers";
import bcrypt from "bcryptjs";
import { signIn, signOut, auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  registerSchema,
  changePasswordSchema,
  resetPasswordSchema,
} from "@/lib/validations";
import {
  emailVerificationEnabled,
  sendVerificationEmail,
  sendPasswordResetEmail,
} from "@/lib/email";
import { rateLimitByIp } from "@/lib/rate-limit";

const TOO_MANY = "Çok fazla deneme yaptınız. Lütfen biraz sonra tekrar deneyin.";

// Mutlak URL üretir (e-posta bağlantıları için).
async function absoluteUrl(path: string) {
  const h = await headers();
  const host = h.get("host") ?? "localhost:3100";
  const proto = host.includes("localhost") ? "http" : "https";
  return `${proto}://${host}${path}`;
}

export type ActionState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  success?: string;
  // Hata olunca girilen değerleri geri yollar (parola hariç) -> form temizlenmez.
  values?: Record<string, string>;
  needsVerification?: boolean;
};

// Doğrulama tokenı üretir, kaydeder ve e-postayı gönderir.
async function sendVerifyTo(email: string) {
  // Süresi dolmuş eski tokenları temizle (A7)
  await prisma.verificationToken
    .deleteMany({ where: { identifier: email, expires: { lt: new Date() } } })
    .catch(() => {});
  const token = crypto.randomUUID().replace(/-/g, "");
  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  });
  await sendVerificationEmail(email, await absoluteUrl(`/dogrula/${token}`));
}

export async function registerAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  if (!(await rateLimitByIp("register", 5, 60 * 60))) {
    return { error: TOO_MANY };
  }
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

  const verifyEnabled = emailVerificationEnabled();
  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  await prisma.user.create({
    data: {
      email,
      passwordHash,
      role: "USER",
      emailVerified: verifyEnabled ? null : new Date(),
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

  // E-posta doğrulama AÇIK ise: doğrulama maili gönder, otomatik giriş YAPMA
  if (verifyEnabled) {
    await sendVerifyTo(email).catch(() => {});
    return {
      success:
        "Hesabınız oluşturuldu! E-postanıza gönderdiğimiz doğrulama bağlantısına tıkladıktan sonra giriş yapabilirsiniz.",
    };
  }

  // E-posta servisi yoksa otomatik giriş (mevcut davranış)
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

export async function resendVerificationAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const email = String(formData.get("email") ?? "").toLowerCase().trim();
  if (!email) return { error: "E-posta gerekli." };
  if (!(await rateLimitByIp("resend", 5, 60 * 60, email))) {
    return { error: TOO_MANY };
  }
  if (!emailVerificationEnabled()) {
    return { success: "E-posta doğrulama şu anda devre dışı." };
  }
  const user = await prisma.user.findUnique({
    where: { email },
    select: { emailVerified: true, deletedAt: true },
  });
  if (user && !user.deletedAt && !user.emailVerified) {
    await sendVerifyTo(email).catch(() => {});
  }
  // Bilgi sızdırmamak için her durumda aynı mesaj
  return { success: "Doğrulama bağlantısı e-posta adresinize tekrar gönderildi." };
}

export async function loginAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const callbackUrl = String(formData.get("callbackUrl") ?? "/hesabim");
  const remember = formData.get("remember") === "on" ? "1" : "0";

  // Brute-force koruması (IP + e-posta)
  if (!(await rateLimitByIp("login", 10, 15 * 60, email.toLowerCase().trim()))) {
    return { error: TOO_MANY, values: { email } };
  }

  // E-posta doğrulama açıksa, doğrulanmamış kullanıcıya net mesaj ver
  if (emailVerificationEnabled()) {
    const u = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      select: { emailVerified: true, deletedAt: true },
    });
    if (u && !u.deletedAt && !u.emailVerified) {
      return {
        error:
          "E-postanız doğrulanmamış. Gelen kutunuzu kontrol edin ya da doğrulama bağlantısını tekrar gönderin.",
        needsVerification: true,
        values: { email },
      };
    }
  }

  try {
    await signIn("credentials", {
      email,
      password,
      remember,
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
  if (!(await rateLimitByIp("forgot", 5, 60 * 60, email))) {
    return { error: TOO_MANY };
  }

  // Enumerasyonu önlemek için her durumda AYNI mesaj; link asla gösterilmez.
  const generic: ActionState = {
    success:
      "Eğer bu e-posta kayıtlıysa, parola sıfırlama bağlantısı e-posta adresinize gönderildi.",
  };

  const user = await prisma.user.findUnique({ where: { email } });
  if (user && !user.deletedAt) {
    await prisma.verificationToken
      .deleteMany({ where: { identifier: email, expires: { lt: new Date() } } })
      .catch(() => {});
    const token = crypto.randomUUID().replace(/-/g, "");
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires: new Date(Date.now() + 60 * 60 * 1000),
      },
    });
    await sendPasswordResetEmail(
      email,
      await absoluteUrl(`/sifre-sifirla/${token}`)
    ).catch(() => {});
  }
  return generic;
}

export async function resetPasswordAction(
  token: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = resetPasswordSchema.safeParse({
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const newPassword = parsed.data.newPassword;

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
