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

async function ensureAdmin() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
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
  await ensureAdmin();
  const listing = await prisma.listing.update({
    where: { id },
    data: { status: "APPROVED", publishedAt: new Date(), rejectReason: null },
    select: { authorId: true, title: true, slug: true },
  });
  await prisma.notification.create({
    data: {
      userId: listing.authorId,
      type: "LISTING_APPROVED",
      title: "İlanınız onaylandı",
      body: `"${listing.title}" ilanınız yayına alındı.`,
      linkUrl: `/ilanlar/${listing.slug}`,
    },
  });
  revalidatePath("/admin/ilanlar");
  revalidatePath("/");
  revalidatePath("/ilanlar");
}

export async function rejectListingAction(id: string, formData: FormData) {
  await ensureAdmin();
  const reason = String(formData.get("reason") ?? "").slice(0, 300);
  const listing = await prisma.listing.update({
    where: { id },
    data: { status: "REJECTED", rejectReason: reason || "Uygun bulunmadı." },
    select: { authorId: true, title: true },
  });
  await prisma.notification.create({
    data: {
      userId: listing.authorId,
      type: "LISTING_REJECTED",
      title: "İlanınız reddedildi",
      body: `"${listing.title}" ilanınız reddedildi. ${reason ? "Sebep: " + reason : ""}`,
      linkUrl: "/hesabim/ilanlarim",
    },
  });
  revalidatePath("/admin/ilanlar");
}

export async function adminDeleteListingAction(id: string) {
  await ensureAdmin();
  await prisma.listing.update({
    where: { id },
    data: { deletedAt: new Date(), status: "ARCHIVED" },
  });
  revalidatePath("/admin/ilanlar");
  revalidatePath("/ilanlar");
}

export async function updateListingAdminAction(
  id: string,
  _prev: AdminState,
  formData: FormData
): Promise<AdminState> {
  await ensureAdmin();
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
export async function setUserBanAction(id: string, banned: boolean) {
  await ensureAdmin();
  await prisma.user.update({ where: { id }, data: { isBanned: banned } });
  revalidatePath("/admin/uyeler");
  revalidatePath(`/admin/uyeler/${id}`);
}

export async function setUserRoleAction(id: string, role: string) {
  await ensureAdmin();
  if (role !== "USER" && role !== "ADMIN") return;
  await prisma.user.update({ where: { id }, data: { role } });
  revalidatePath("/admin/uyeler");
  revalidatePath(`/admin/uyeler/${id}`);
}

export async function adminDeleteUserAction(id: string) {
  const me = await ensureAdmin();
  if (id === me) throw new Error("Kendinizi silemezsiniz.");
  await prisma.user.update({
    where: { id },
    data: { deletedAt: new Date(), isBanned: true },
  });
  await prisma.listing.updateMany({
    where: { authorId: id },
    data: { deletedAt: new Date(), status: "ARCHIVED" },
  });
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
  const me = await ensureAdmin();
  if (!["OPEN", "REVIEWING", "RESOLVED", "DISMISSED"].includes(status)) return;
  await prisma.report.update({
    where: { id },
    data: { status, resolvedById: me },
  });
  revalidatePath("/admin/sikayetler");
}

// ---------- Mesajlar ----------
export async function adminDeleteMessageAction(id: string) {
  await ensureAdmin();
  await prisma.message.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
  revalidatePath("/admin/mesajlar");
}

// ---------- Site ayarları ----------
export async function updateSiteSettingsAction(
  _prev: AdminState,
  formData: FormData
): Promise<AdminState> {
  await ensureAdmin();
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

  revalidatePath("/", "layout");
  return { success: "Site ayarları güncellendi." };
}
