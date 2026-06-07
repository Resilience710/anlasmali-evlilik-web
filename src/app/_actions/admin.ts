"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { slugify } from "@/lib/utils";
import {
  categorySchema,
  citySchema,
  ageOptionSchema,
  siteSettingSchema,
} from "@/lib/validations";
import { logAudit } from "@/lib/audit";

async function ensureAdmin() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    throw new Error("Yetkisiz işlem.");
  }
  return session.user.id;
}

/** Moderasyon yetkisi: ADMIN veya MODERATOR. */
async function ensureStaff() {
  const session = await auth();
  const role = session?.user?.role;
  if (!session?.user?.id || (role !== "ADMIN" && role !== "MODERATOR")) {
    throw new Error("Yetkisiz işlem.");
  }
  return session.user.id;
}

export type AdminState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  success?: string;
};

// ---------- İlanlar ----------
export async function approveListingAction(id: string) {
  const adminId = await ensureStaff();
  // İlan güncelleme + bildirim tek transaction (kısmi durum kalmasın)
  const listing = await prisma.$transaction(async (tx) => {
    const l = await tx.listing.update({
      where: { id },
      data: { status: "APPROVED", publishedAt: new Date(), rejectReason: null },
      select: { authorId: true, title: true, slug: true },
    });
    await tx.notification.create({
      data: {
        userId: l.authorId,
        type: "LISTING_APPROVED",
        title: "İlanınız onaylandı",
        body: `"${l.title}" ilanınız yayına alındı.`,
        linkUrl: `/ilanlar/${l.slug}`,
      },
    });
    return l;
  });
  await logAudit(adminId, "İlan onaylandı", {
    targetType: "Listing",
    targetId: id,
    detail: listing.title,
  });
  revalidatePath("/admin/ilanlar");
  revalidatePath("/");
  revalidatePath("/ilanlar");
}

export async function rejectListingAction(id: string, formData: FormData) {
  const adminId = await ensureStaff();
  const reason = String(formData.get("reason") ?? "").slice(0, 300);
  await prisma.$transaction(async (tx) => {
    const l = await tx.listing.update({
      where: { id },
      data: { status: "REJECTED", rejectReason: reason || "Uygun bulunmadı." },
      select: { authorId: true, title: true },
    });
    await tx.notification.create({
      data: {
        userId: l.authorId,
        type: "LISTING_REJECTED",
        title: "İlanınız reddedildi",
        body: `"${l.title}" ilanınız reddedildi. ${reason ? "Sebep: " + reason : ""}`,
        linkUrl: "/hesabim/ilanlarim",
      },
    });
    return l;
  });
  await logAudit(adminId, "İlan reddedildi", {
    targetType: "Listing",
    targetId: id,
    detail: reason || undefined,
  });
  revalidatePath("/admin/ilanlar");
}

export async function adminDeleteListingAction(id: string) {
  const adminId = await ensureStaff();
  await prisma.listing.update({
    where: { id },
    data: { deletedAt: new Date(), status: "ARCHIVED" },
  });
  await logAudit(adminId, "İlan silindi", { targetType: "Listing", targetId: id });
  revalidatePath("/admin/ilanlar");
  revalidatePath("/ilanlar");
}

export async function updateListingAdminAction(
  id: string,
  _prev: AdminState,
  formData: FormData
): Promise<AdminState> {
  await ensureStaff();
  const { listingSchema } = await import("@/lib/validations");
  const parsed = listingSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    categoryId: formData.get("categoryId"),
    cityId: formData.get("cityId"),
    age: formData.get("age"),
    gender: formData.get("gender"),
    targetGender: formData.get("targetGender"),
    imageUrl: formData.get("imageUrl") || "",
  });
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };
  const d = parsed.data;
  await prisma.listing.update({
    where: { id },
    data: {
      title: d.title,
      description: d.description,
      age: d.age,
      gender: d.gender,
      targetGender: d.targetGender,
      categoryId: d.categoryId,
      cityId: d.cityId,
      imageUrl: d.imageUrl || null,
    },
  });
  revalidatePath("/admin/ilanlar");
  revalidatePath(`/admin/ilanlar/${id}`);
  return { success: "İlan güncellendi." };
}

// ---------- Üyeler ----------
export async function setUserBanAction(
  id: string,
  banned: boolean,
  reason?: string,
  durationDays?: number
) {
  const adminId = await ensureStaff();
  const banExpiresAt =
    banned && durationDays && durationDays > 0
      ? new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000)
      : null;
  await prisma.user.update({
    where: { id },
    data: banned
      ? { isBanned: true, banReason: reason?.slice(0, 300) || null, banExpiresAt }
      : { isBanned: false, banReason: null, banExpiresAt: null },
  });
  await logAudit(adminId, banned ? "Üye yasaklandı" : "Üye yasağı kaldırıldı", {
    targetType: "User",
    targetId: id,
    detail: banned
      ? [reason, durationDays ? `${durationDays} gün` : "kalıcı"]
          .filter(Boolean)
          .join(" · ")
      : undefined,
  });
  revalidatePath("/admin/uyeler");
  revalidatePath(`/admin/uyeler/${id}`);
}

export async function setUserRoleAction(id: string, role: string) {
  const adminId = await ensureAdmin();
  if (!["USER", "MODERATOR", "ADMIN"].includes(role)) return;
  await prisma.user.update({ where: { id }, data: { role } });
  await logAudit(adminId, "Üye rolü değiştirildi", {
    targetType: "User",
    targetId: id,
    detail: role,
  });
  revalidatePath("/admin/uyeler");
  revalidatePath(`/admin/uyeler/${id}`);
}

export async function adminDeleteUserAction(id: string) {
  const me = await ensureAdmin();
  if (id === me) throw new Error("Kendinizi silemezsiniz.");
  await prisma.$transaction([
    prisma.user.update({
      where: { id },
      data: { deletedAt: new Date(), isBanned: true },
    }),
    prisma.listing.updateMany({
      where: { authorId: id },
      data: { deletedAt: new Date(), status: "ARCHIVED" },
    }),
  ]);
  await logAudit(me, "Üye silindi", { targetType: "User", targetId: id });
  revalidatePath("/admin/uyeler");
}

// ---------- Kategoriler ----------
export async function upsertCategoryAction(formData: FormData): Promise<void> {
  await ensureAdmin();
  const id = String(formData.get("id") ?? "");
  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
    order: formData.get("order") ?? 0,
    isActive: formData.get("isActive") === "on",
  });
  if (!parsed.success) return;
  const data = parsed.data;
  const slug = slugify(data.name);
  if (id) {
    await prisma.category.update({
      where: { id },
      data: { name: data.name, order: data.order, isActive: data.isActive },
    });
  } else {
    await prisma.category.create({
      data: { name: data.name, slug, order: data.order, isActive: data.isActive },
    });
  }
  revalidatePath("/admin/kategoriler");
  revalidatePath("/");
}

export async function deleteCategoryAction(id: string) {
  await ensureAdmin();
  const count = await prisma.listing.count({ where: { categoryId: id } });
  if (count > 0) {
    await prisma.category.update({ where: { id }, data: { isActive: false } });
  } else {
    await prisma.category.delete({ where: { id } });
  }
  revalidatePath("/admin/kategoriler");
}

// ---------- Şehirler ----------
export async function upsertCityAction(formData: FormData): Promise<void> {
  await ensureAdmin();
  const id = String(formData.get("id") ?? "");
  const parsed = citySchema.safeParse({
    name: formData.get("name"),
    order: formData.get("order") ?? 0,
    isActive: formData.get("isActive") === "on",
  });
  if (!parsed.success) return;
  const data = parsed.data;
  const slug = slugify(data.name);
  if (id) {
    await prisma.city.update({
      where: { id },
      data: { name: data.name, order: data.order, isActive: data.isActive },
    });
  } else {
    await prisma.city.create({
      data: { name: data.name, slug, order: data.order, isActive: data.isActive },
    });
  }
  revalidatePath("/admin/sehirler");
  revalidatePath("/");
}

export async function deleteCityAction(id: string) {
  await ensureAdmin();
  const count = await prisma.listing.count({ where: { cityId: id } });
  if (count > 0) {
    await prisma.city.update({ where: { id }, data: { isActive: false } });
  } else {
    await prisma.city.delete({ where: { id } });
  }
  revalidatePath("/admin/sehirler");
}

// ---------- Yaş seçenekleri ----------
export async function upsertAgeOptionAction(formData: FormData): Promise<void> {
  await ensureAdmin();
  const id = String(formData.get("id") ?? "");
  const parsed = ageOptionSchema.safeParse({
    label: formData.get("label"),
    minAge: formData.get("minAge"),
    maxAge: formData.get("maxAge"),
    order: formData.get("order") ?? 0,
    isActive: formData.get("isActive") === "on",
  });
  if (!parsed.success) return;
  const data = parsed.data;
  if (id) {
    await prisma.ageOption.update({ where: { id }, data });
  } else {
    await prisma.ageOption.create({ data });
  }
  revalidatePath("/admin/yas-secenekleri");
}

export async function deleteAgeOptionAction(id: string) {
  await ensureAdmin();
  await prisma.ageOption.delete({ where: { id } });
  revalidatePath("/admin/yas-secenekleri");
}

// ---------- Şikayetler ----------
export async function resolveReportAction(id: string, status: string) {
  const me = await ensureStaff();
  if (!["OPEN", "REVIEWING", "RESOLVED", "DISMISSED"].includes(status)) return;
  await prisma.report.update({
    where: { id },
    data: { status, resolvedById: me },
  });
  await logAudit(me, "Şikayet durumu güncellendi", {
    targetType: "Report",
    targetId: id,
    detail: status,
  });
  revalidatePath("/admin/sikayetler");
}

// ---------- Mesajlar ----------
export async function adminDeleteMessageAction(id: string) {
  const adminId = await ensureStaff();
  await prisma.message.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
  await logAudit(adminId, "Mesaj silindi", {
    targetType: "Message",
    targetId: id,
  });
  revalidatePath("/admin/mesajlar");
}

// ---------- Site ayarları ----------
export async function updateSiteSettingsAction(
  _prev: AdminState,
  formData: FormData
): Promise<AdminState> {
  const adminId = await ensureAdmin();
  const parsed = siteSettingSchema.safeParse({
    siteName: formData.get("siteName"),
    tagline: formData.get("tagline") || undefined,
    logoUrl: formData.get("logoUrl") || undefined,
    heroTitle: formData.get("heroTitle"),
    heroSubtitle: formData.get("heroSubtitle") || undefined,
    aboutText: formData.get("aboutText") || undefined,
    contactEmail: formData.get("contactEmail") || undefined,
    contactPhone: formData.get("contactPhone") || undefined,
    contactText: formData.get("contactText") || undefined,
    termsText: formData.get("termsText") || undefined,
    privacyText: formData.get("privacyText") || undefined,
    happyCount: formData.get("happyCount") || undefined,
  });
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };
  const d = parsed.data;

  const social = {
    facebook: String(formData.get("facebook") ?? ""),
    instagram: String(formData.get("instagram") ?? ""),
    x: String(formData.get("x") ?? ""),
    youtube: String(formData.get("youtube") ?? ""),
  };

  await prisma.siteSetting.upsert({
    where: { id: "singleton" },
    update: {
      siteName: d.siteName,
      tagline: d.tagline,
      logoUrl: d.logoUrl || null,
      heroTitle: d.heroTitle,
      heroSubtitle: d.heroSubtitle,
      aboutText: d.aboutText,
      contactEmail: d.contactEmail || null,
      contactPhone: d.contactPhone,
      contactText: d.contactText,
      termsText: d.termsText,
      privacyText: d.privacyText,
      happyCount: d.happyCount ?? 0,
      socialJson: JSON.stringify(social),
    },
    create: {
      id: "singleton",
      siteName: d.siteName,
      tagline: d.tagline,
      logoUrl: d.logoUrl || null,
      heroTitle: d.heroTitle,
      heroSubtitle: d.heroSubtitle,
      aboutText: d.aboutText,
      contactEmail: d.contactEmail || null,
      contactPhone: d.contactPhone,
      contactText: d.contactText,
      termsText: d.termsText,
      privacyText: d.privacyText,
      happyCount: d.happyCount ?? 0,
      socialJson: JSON.stringify(social),
    },
  });

  await logAudit(adminId, "Site ayarları güncellendi", {
    targetType: "SiteSetting",
  });
  revalidatePath("/", "layout");
  return { success: "Site ayarları güncellendi." };
}

// ---------- Toplu işlemler (#12) ----------
export async function bulkSetUserBanAction(ids: string[], banned: boolean) {
  const me = await ensureStaff();
  const targets = ids.filter((id) => id !== me);
  if (targets.length === 0) return;
  await prisma.user.updateMany({
    where: { id: { in: targets } },
    data: banned
      ? { isBanned: true }
      : { isBanned: false, banReason: null, banExpiresAt: null },
  });
  await logAudit(me, banned ? "Toplu üye yasaklandı" : "Toplu yasak kaldırıldı", {
    targetType: "User",
    detail: `${targets.length} üye`,
  });
  revalidatePath("/admin/uyeler");
}

export async function bulkDeleteUsersAction(ids: string[]) {
  const me = await ensureAdmin();
  const targets = ids.filter((id) => id !== me);
  if (targets.length === 0) return;
  await prisma.user.updateMany({
    where: { id: { in: targets } },
    data: { deletedAt: new Date(), isBanned: true },
  });
  await prisma.listing.updateMany({
    where: { authorId: { in: targets } },
    data: { deletedAt: new Date(), status: "ARCHIVED" },
  });
  await logAudit(me, "Toplu üye silindi", {
    targetType: "User",
    detail: `${targets.length} üye`,
  });
  revalidatePath("/admin/uyeler");
}

export async function bulkApproveListingsAction(ids: string[]) {
  const me = await ensureStaff();
  if (ids.length === 0) return;
  await prisma.listing.updateMany({
    where: { id: { in: ids } },
    data: { status: "APPROVED", publishedAt: new Date(), rejectReason: null },
  });
  await logAudit(me, "Toplu ilan onaylandı", {
    targetType: "Listing",
    detail: `${ids.length} ilan`,
  });
  revalidatePath("/admin/ilanlar");
  revalidatePath("/ilanlar");
  revalidatePath("/");
}

export async function bulkDeleteListingsAction(ids: string[]) {
  const me = await ensureStaff();
  if (ids.length === 0) return;
  await prisma.listing.updateMany({
    where: { id: { in: ids } },
    data: { deletedAt: new Date(), status: "ARCHIVED" },
  });
  await logAudit(me, "Toplu ilan silindi", {
    targetType: "Listing",
    detail: `${ids.length} ilan`,
  });
  revalidatePath("/admin/ilanlar");
  revalidatePath("/ilanlar");
}

// ---------- Yasaklı kelimeler (#1) ----------
export async function addBannedWordAction(formData: FormData): Promise<void> {
  const me = await ensureAdmin();
  const word = String(formData.get("word") ?? "")
    .trim()
    .toLocaleLowerCase("tr-TR");
  if (word.length < 2 || word.length > 60) return;
  await prisma.bannedWord
    .create({ data: { word } })
    .catch(() => {}); // zaten varsa yoksay
  await logAudit(me, "Yasaklı kelime eklendi", {
    targetType: "BannedWord",
    detail: word,
  });
  revalidatePath("/admin/yasakli-kelimeler");
}

export async function deleteBannedWordAction(id: string) {
  const me = await ensureAdmin();
  await prisma.bannedWord.delete({ where: { id } }).catch(() => {});
  await logAudit(me, "Yasaklı kelime silindi", {
    targetType: "BannedWord",
    targetId: id,
  });
  revalidatePath("/admin/yasakli-kelimeler");
}
