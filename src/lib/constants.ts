// Şemada string olarak tutulan "enum benzeri" alanların sabitleri + Türkçe etiketleri.

export const ROLES = ["USER", "ADMIN"] as const;
export type Role = (typeof ROLES)[number];

export const GENDERS = ["MALE", "FEMALE"] as const;
export type Gender = (typeof GENDERS)[number];

export const GENDER_LABELS: Record<Gender, string> = {
  MALE: "Erkek",
  FEMALE: "Kadın",
};

export const LISTING_STATUSES = [
  "PENDING",
  "APPROVED",
  "REJECTED",
  "ARCHIVED",
] as const;
export type ListingStatus = (typeof LISTING_STATUSES)[number];

export const LISTING_STATUS_LABELS: Record<ListingStatus, string> = {
  PENDING: "Onay Bekliyor",
  APPROVED: "Yayında",
  REJECTED: "Reddedildi",
  ARCHIVED: "Arşivlendi",
};

export const REPORT_STATUSES = [
  "OPEN",
  "REVIEWING",
  "RESOLVED",
  "DISMISSED",
] as const;
export type ReportStatus = (typeof REPORT_STATUSES)[number];

export const REPORT_STATUS_LABELS: Record<ReportStatus, string> = {
  OPEN: "Açık",
  REVIEWING: "İnceleniyor",
  RESOLVED: "Çözüldü",
  DISMISSED: "Reddedildi",
};

export const REPORT_TARGET_TYPES = ["LISTING", "USER", "MESSAGE"] as const;
export type ReportTargetType = (typeof REPORT_TARGET_TYPES)[number];

export const NOTIFICATION_TYPES = [
  "MESSAGE",
  "FAVORITE",
  "LISTING_APPROVED",
  "LISTING_REJECTED",
  "REPORT",
  "SYSTEM",
] as const;
export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

/**
 * İlanlar yayınlanmadan önce yönetici onayı gereksin mi?
 * false  -> ilan oluşturulunca/güncellenince ANINDA yayınlanır (onay kapalı).
 * true   -> ilan önce "Onay Bekliyor" olur, admin onaylayınca yayınlanır.
 * Onaylama altyapısı (admin paneli onay kuyruğu, approve/reject) korunur;
 * yalnızca bu bayrağı true yapmak özelliği geri açar.
 */
export const LISTING_REQUIRES_APPROVAL = false;

/** Kullanıcının "online" sayılması için son aktiflik eşiği (ms). */
export const ONLINE_THRESHOLD_MS = 5 * 60 * 1000;

/** Mesaj polling aralığı (ms) - yerel/fallback transport. */
export const MESSAGE_POLL_INTERVAL_MS = 4000;

export const SITE_NAV = [
  { href: "/", label: "Ana Sayfa" },
  { href: "/ilanlar", label: "İlanlar" },
  { href: "/hesabim/ilan-olustur", label: "İlan Oluştur" },
  { href: "/uyeler", label: "Üyeler" },
  { href: "/hesabim/mesajlar", label: "Mesajlar" },
  { href: "/hakkimizda", label: "Hakkımızda" },
  { href: "/iletisim", label: "İletişim" },
] as const;

export const ACCOUNT_NAV = [
  { href: "/hesabim/profil", label: "Profil Bilgilerim", icon: "user" },
  { href: "/hesabim/ilanlarim", label: "İlanlarım", icon: "list" },
  { href: "/hesabim/favorilerim", label: "Favorilerim", icon: "heart" },
  { href: "/hesabim/mesajlar", label: "Mesajlarım", icon: "message" },
  { href: "/hesabim/bildirimler", label: "Bildirimlerim", icon: "bell" },
  { href: "/hesabim/ayarlar", label: "Hesap Ayarlarım", icon: "settings" },
  { href: "/hesabim/sifre-degistir", label: "Şifre Değiştir", icon: "key" },
] as const;
