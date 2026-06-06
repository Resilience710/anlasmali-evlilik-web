import type { Metadata } from "next";
import { requireUser } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { ProfileForm } from "@/components/dashboard/profile-form";

export const metadata: Metadata = { title: "Profil Bilgilerim" };

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ eksik?: string }>;
}) {
  const user = await requireUser();
  const sp = await searchParams;
  const [profile, cities] = await Promise.all([
    prisma.profile.findUnique({ where: { userId: user.id } }),
    prisma.city.findMany({ where: { isActive: true }, orderBy: { order: "asc" } }),
  ]);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-bold">Profil Bilgilerim</h1>
        <p className="text-sm text-muted-foreground">
          Profilinizi güncel tutarak daha çok ilgi çekin.
        </p>
      </div>
      {sp.eksik && (
        <div className="rounded-[var(--radius-card)] border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning">
          İlan oluşturabilmek için lütfen tüm profil bilgilerinizi doldurun.
        </div>
      )}
      <div className="rounded-[var(--radius-card)] border border-border bg-surface p-6">
        <ProfileForm
          cities={cities}
          defaults={{
            displayName: profile?.displayName ?? "",
            username: profile?.username,
            bio: profile?.bio,
            gender: profile?.gender,
            age: profile?.age,
            cityId: profile?.cityId,
            lookingFor: profile?.lookingFor,
            avatarUrl: profile?.avatarUrl,
            phone: profile?.phone,
            profession: profile?.profession,
            jobTitle: profile?.jobTitle,
            education: profile?.education,
            maritalStatus: profile?.maritalStatus,
            bodyType: profile?.bodyType,
            zodiac: profile?.zodiac,
            height: profile?.height,
            weight: profile?.weight,
            smoking: profile?.smoking,
            alcohol: profile?.alcohol,
          }}
        />
      </div>
    </div>
  );
}
