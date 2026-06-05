"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { profileSchema } from "@/lib/validations";

export type ProfileActionState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  success?: string;
};

export async function updateProfileAction(
  _prev: ProfileActionState,
  formData: FormData
): Promise<ProfileActionState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Oturum bulunamadı." };

  const parsed = profileSchema.safeParse({
    displayName: formData.get("displayName"),
    username: formData.get("username") || undefined,
    bio: formData.get("bio") || undefined,
    gender: formData.get("gender") || undefined,
    age: formData.get("age") || undefined,
    cityId: formData.get("cityId") || undefined,
    lookingFor: formData.get("lookingFor") || undefined,
    avatarUrl: formData.get("avatarUrl") || "",
    phone: formData.get("phone") || undefined,
    profession: formData.get("profession") || undefined,
    jobTitle: formData.get("jobTitle") || undefined,
    education: formData.get("education") || undefined,
    maritalStatus: formData.get("maritalStatus") || undefined,
    bodyType: formData.get("bodyType") || undefined,
    zodiac: formData.get("zodiac") || undefined,
    height: formData.get("height") || undefined,
    weight: formData.get("weight") || undefined,
    smoking: formData.get("smoking") || undefined,
    alcohol: formData.get("alcohol") || undefined,
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const d = parsed.data;
  const detailData = {
    displayName: d.displayName,
    username: d.username || null,
    bio: d.bio || null,
    gender: d.gender || null,
    age: d.age ?? null,
    cityId: d.cityId || null,
    lookingFor: d.lookingFor || null,
    avatarUrl: d.avatarUrl || null,
    phone: d.phone || null,
    profession: d.profession || null,
    jobTitle: d.jobTitle || null,
    education: d.education || null,
    maritalStatus: d.maritalStatus || null,
    bodyType: d.bodyType || null,
    zodiac: d.zodiac || null,
    height: d.height ?? null,
    weight: d.weight ?? null,
    smoking: d.smoking || null,
    alcohol: d.alcohol || null,
  };
  await prisma.profile.upsert({
    where: { userId: session.user.id },
    update: detailData,
    create: { userId: session.user.id, ...detailData },
  });

  revalidatePath("/hesabim/profil");
  revalidatePath("/hesabim");
  return { success: "Profiliniz güncellendi." };
}
