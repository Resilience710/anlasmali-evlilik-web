// İlan oluşturmadan önce profilin eksiksiz olmasını kontrol eder.
// Not: Profil fotoğrafı (avatarUrl) şimdilik zorunlu tutulmadı; çünkü canlıda
// (Vercel) görsel yükleme Cloudinary/VPS depolaması bağlanana kadar çalışmıyor.
// Depolama hazır olunca avatarUrl'i de bu listeye ekleyebiliriz.

export type ProfileLike = Record<string, unknown> | null | undefined;

export const REQUIRED_PROFILE_FIELDS: { key: string; label: string }[] = [
  { key: "displayName", label: "Ad Soyad" },
  { key: "username", label: "Takma Ad" },
  { key: "phone", label: "Telefon" },
  { key: "gender", label: "Cinsiyet" },
  { key: "age", label: "Yaş" },
  { key: "cityId", label: "Şehir" },
  { key: "lookingFor", label: "Aradığınız Kişi" },
  { key: "bio", label: "Hakkımda" },
  { key: "profession", label: "Meslek" },
  { key: "jobTitle", label: "Ünvan" },
  { key: "education", label: "Eğitim" },
  { key: "maritalStatus", label: "Medeni Hal" },
  { key: "bodyType", label: "Vücut Tipi" },
  { key: "zodiac", label: "Burç" },
  { key: "height", label: "Boy" },
  { key: "weight", label: "Kilo" },
  { key: "smoking", label: "Sigara" },
  { key: "alcohol", label: "Alkol" },
];

export function getMissingProfileFields(profile: ProfileLike): string[] {
  if (!profile) return REQUIRED_PROFILE_FIELDS.map((f) => f.label);
  return REQUIRED_PROFILE_FIELDS.filter((f) => {
    const v = (profile as Record<string, unknown>)[f.key];
    return v === null || v === undefined || v === "";
  }).map((f) => f.label);
}

export function isProfileComplete(profile: ProfileLike): boolean {
  return getMissingProfileFields(profile).length === 0;
}
