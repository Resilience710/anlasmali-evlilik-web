import { z } from "zod";
import { GENDERS } from "./constants";

export const loginSchema = z.object({
  email: z.string().email("Geçerli bir e-posta girin"),
  password: z.string().min(1, "Parola gerekli"),
});

export const registerSchema = z
  .object({
    displayName: z
      .string()
      .min(2, "İsim en az 2 karakter olmalı")
      .max(50, "İsim en fazla 50 karakter"),
    email: z.string().email("Geçerli bir e-posta girin"),
    password: z
      .string()
      .min(8, "Parola en az 8 karakter olmalı")
      .max(72, "Parola çok uzun"),
    confirmPassword: z.string(),
    gender: z.enum(GENDERS, { message: "Cinsiyet seçin" }),
    acceptTerms: z
      .boolean()
      .refine((v) => v === true, "Kullanım şartlarını kabul etmelisiniz"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Parolalar eşleşmiyor",
    path: ["confirmPassword"],
  });

export const profileSchema = z.object({
  displayName: z.string().min(2, "İsim en az 2 karakter").max(50),
  bio: z.string().max(1000, "Biyografi en fazla 1000 karakter").optional(),
  gender: z.enum(GENDERS).optional(),
  age: z.coerce
    .number()
    .int()
    .min(18, "En az 18 yaşında olmalısınız")
    .max(99)
    .optional(),
  cityId: z.string().optional(),
  lookingFor: z.enum(GENDERS).optional(),
  avatarUrl: z.string().url().optional().or(z.literal("")),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Mevcut parola gerekli"),
    newPassword: z.string().min(8, "Yeni parola en az 8 karakter"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Parolalar eşleşmiyor",
    path: ["confirmPassword"],
  });

export const listingSchema = z.object({
  title: z.string().min(5, "Başlık en az 5 karakter").max(120),
  description: z
    .string()
    .min(20, "Açıklama en az 20 karakter")
    .max(3000, "Açıklama en fazla 3000 karakter"),
  categoryId: z.string().min(1, "Kategori seçin"),
  cityId: z.string().min(1, "Şehir seçin"),
  age: z.coerce.number().int().min(18, "En az 18").max(99),
  gender: z.enum(GENDERS, { message: "Cinsiyetinizi seçin" }),
  targetGender: z.enum(GENDERS, { message: "Aradığınız kişiyi seçin" }),
  imageUrl: z.string().url().optional().or(z.literal("")),
});

export const messageSchema = z.object({
  recipientId: z.string().min(1),
  body: z.string().min(1, "Mesaj boş olamaz").max(2000),
});

export const reportSchema = z.object({
  targetType: z.enum(["LISTING", "USER", "MESSAGE"]),
  listingId: z.string().optional(),
  reportedUserId: z.string().optional(),
  reason: z.string().min(1, "Sebep seçin"),
  detail: z.string().max(1000).optional(),
});

export const contactSchema = z.object({
  name: z.string().min(2, "İsim gerekli").max(80),
  email: z.string().email("Geçerli e-posta girin"),
  subject: z.string().min(2, "Konu gerekli").max(120),
  message: z.string().min(10, "Mesaj en az 10 karakter").max(2000),
});

// ---- Admin ----
export const categorySchema = z.object({
  name: z.string().min(2).max(60),
  order: z.coerce.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

export const citySchema = z.object({
  name: z.string().min(2).max(60),
  order: z.coerce.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

export const ageOptionSchema = z.object({
  label: z.string().min(1).max(20),
  minAge: z.coerce.number().int().min(18).max(99),
  maxAge: z.coerce.number().int().min(18).max(120),
  order: z.coerce.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

export const siteSettingSchema = z.object({
  siteName: z.string().min(1).max(80),
  tagline: z.string().max(120).optional(),
  logoUrl: z.string().optional(),
  heroTitle: z.string().min(1).max(160),
  heroSubtitle: z.string().max(400).optional(),
  aboutText: z.string().max(5000).optional(),
  contactEmail: z.string().email().optional().or(z.literal("")),
  contactPhone: z.string().max(40).optional(),
  termsText: z.string().max(20000).optional(),
  privacyText: z.string().max(20000).optional(),
  happyCount: z.coerce.number().int().min(0).optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type ListingInput = z.infer<typeof listingSchema>;
