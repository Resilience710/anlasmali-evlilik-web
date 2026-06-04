"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { listingSchema } from "@/lib/validations";
import { slugify, randomSuffix } from "@/lib/utils";

export type ListingActionState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
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

export async function createListingAction(
  _prev: ListingActionState,
  formData: FormData
): Promise<ListingActionState> {
  const session = await auth();
  if (!session?.user?.id) redirect("/giris?callbackUrl=/hesabim/ilan-olustur");

  const parsed = listingSchema.safeParse(parseForm(formData));
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
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
      status: "PENDING",
    },
  });

  // Yöneticilere bildirim
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

  revalidatePath("/hesabim/ilanlarim");
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
    select: { authorId: true },
  });
  if (!existing || existing.authorId !== session.user.id) {
    return { error: "Bu ilanı düzenleme yetkiniz yok." };
  }

  const parsed = listingSchema.safeParse(parseForm(formData));
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const d = parsed.data;

  // Düzenlenen ilan yeniden onaya düşer
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
      status: "PENDING",
      rejectReason: null,
    },
  });

  revalidatePath("/hesabim/ilanlarim");
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
