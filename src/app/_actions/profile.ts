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
    bio: formData.get("bio") || undefined,
    gender: formData.get("gender") || undefined,
    age: formData.get("age") || undefined,
    cityId: formData.get("cityId") || undefined,
    lookingFor: formData.get("lookingFor") || undefined,
    avatarUrl: formData.get("avatarUrl") || "",
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const d = parsed.data;
  await prisma.profile.upsert({
    where: { userId: session.user.id },
    update: {
      displayName: d.displayName,
      bio: d.bio || null,
      gender: d.gender || null,
      age: d.age ?? null,
      cityId: d.cityId || null,
      lookingFor: d.lookingFor || null,
      avatarUrl: d.avatarUrl || null,
    },
    create: {
      userId: session.user.id,
      displayName: d.displayName,
      bio: d.bio || null,
      gender: d.gender || null,
      age: d.age ?? null,
      cityId: d.cityId || null,
      lookingFor: d.lookingFor || null,
      avatarUrl: d.avatarUrl || null,
    },
  });

  revalidatePath("/hesabim/profil");
  revalidatePath("/hesabim");
  return { success: "Profiliniz güncellendi." };
}
