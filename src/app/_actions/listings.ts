"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { listingSchema } from "@/lib/validations";
import { slugify, randomSuffix } from "@/lib/utils";
import { LISTING_REQUIRES_APPROVAL } from "@/lib/constants";
import { getMissingProfileFields } from "@/lib/profile-completeness";

export type ListingActionState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  // Hata olduğunda girilen değerleri geri yollayıp formun temizlenmemesini sağlar.
  values?: Record<string, string>;
};

function parseForm(formData: FormData) {
  return {
    title: formData.get("title"),
    description: formData.get("description"),
    categoryId: formData.get("categoryId"),
    cityId: formData.get("cityId"),
    age: formData.get("age"),
    gender: formData.get("gender"),
    targetGender: formData.get("targetGender"),
    imageUrl: formData.get("imageUrl") || "",
  };
}

function formValues(formData: FormData): Record<string, string> {
  const keys = [
    "title",
    "description",
    "categoryId",
    "cityId",
    "age",
    "gender",
    "targetGender",
    "imageUrl",
  ];
  const out: Record<string, string> = {};
  for (const k of keys) out[k] = String(formData.get(k) ?? "");
  return out;
}

export async function createListingAction(
  _prev: ListingActionState,
  formData: FormData
): Promise<ListingActionState> {
  const session = await auth();
  if (!session?.user?.id) redirect("/giris?callbackUrl=/hesabim/ilan-olustur");

  // Profil eksikse ilan oluşturmaya izin verme -> profili tamamlamaya yönlendir
  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
  });
  if (getMissingProfileFields(profile).length > 0) {
    redirect("/hesabim/profil?eksik=1");
  }

  const parsed = listingSchema.safeParse(parseForm(formData));
  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors,
      values: formValues(formData),
    };
  }

  const d = parsed.data;
  const slug = `${slugify(d.title)}-${randomSuffix()}`;

  await prisma.listing.create({
    data: {
      authorId: session.user.id,
      title: d.title,
      slug,
      description: d.description,
      age: d.age,
      gender: d.gender,
      targetGender: d.targetGender,
      categoryId: d.categoryId,
      cityId: d.cityId,
      imageUrl: d.imageUrl || null,
      status: LISTING_REQUIRES_APPROVAL ? "PENDING" : "APPROVED",
      publishedAt: LISTING_REQUIRES_APPROVAL ? null : new Date(),
    },
  });

  // Onay açıksa yöneticilere bildirim gönder
  if (LISTING_REQUIRES_APPROVAL) {
    const admins = await prisma.user.findMany({
      where: { role: "ADMIN", deletedAt: null },
      select: { id: true },
    });
    if (admins.length) {
      await prisma.notification.createMany({
        data: admins.map((a) => ({
          userId: a.id,
          type: "SYSTEM",
          title: "Onay bekleyen ilan",
          body: `"${d.title}" başlıklı yeni ilan onayınızı bekliyor.`,
          linkUrl: "/admin/ilanlar?status=PENDING",
        })),
      });
    }
  }

  revalidatePath("/hesabim/ilanlarim");
  revalidatePath("/");
  revalidatePath("/ilanlar");
  redirect("/hesabim/ilanlarim?created=1");
}

export async function updateListingAction(
  listingId: string,
  _prev: ListingActionState,
  formData: FormData
): Promise<ListingActionState> {
  const session = await auth();
  if (!session?.user?.id) redirect("/giris");

  const existing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: { authorId: true, publishedAt: true },
  });
  if (!existing || existing.authorId !== session.user.id) {
    return { error: "Bu ilanı düzenleme yetkiniz yok." };
  }

  const parsed = listingSchema.safeParse(parseForm(formData));
  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors,
      values: formValues(formData),
    };
  }
  const d = parsed.data;

  // Onay açıksa düzenlenen ilan yeniden onaya düşer; kapalıysa yayında kalır.
  await prisma.listing.update({
    where: { id: listingId },
    data: {
      title: d.title,
      description: d.description,
      age: d.age,
      gender: d.gender,
      targetGender: d.targetGender,
      categoryId: d.categoryId,
      cityId: d.cityId,
      imageUrl: d.imageUrl || null,
      status: LISTING_REQUIRES_APPROVAL ? "PENDING" : "APPROVED",
      publishedAt: LISTING_REQUIRES_APPROVAL
        ? null
        : existing.publishedAt ?? new Date(),
      rejectReason: null,
    },
  });

  revalidatePath("/hesabim/ilanlarim");
  revalidatePath("/");
  revalidatePath("/ilanlar");
  redirect("/hesabim/ilanlarim?updated=1");
}

export async function deleteListingAction(listingId: string) {
  const session = await auth();
  if (!session?.user?.id) redirect("/giris");

  const existing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: { authorId: true },
  });
  if (!existing || existing.authorId !== session.user.id) {
    throw new Error("Yetkisiz işlem.");
  }

  await prisma.listing.update({
    where: { id: listingId },
    data: { deletedAt: new Date(), status: "ARCHIVED" },
  });

  revalidatePath("/hesabim/ilanlarim");
}
