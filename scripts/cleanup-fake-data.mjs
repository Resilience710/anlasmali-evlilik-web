// Sahte/demo verileri temizler. Yalnızca ADMIN kullanıcısı + site ayarları +
// kategoriler + şehirler + yaş seçenekleri + yasaklı kelimeler + denetim
// kayıtları korunur. Diğer her şey silinir.
//
// Kullanım: node --env-file=.env scripts/cleanup-fake-data.mjs

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// 1) Önce durumu yazdır
const before = {
  users: await prisma.user.count(),
  admins: await prisma.user.count({ where: { role: "ADMIN" } }),
  listings: await prisma.listing.count(),
  conversations: await prisma.conversation.count(),
  messages: await prisma.message.count(),
  favorites: await prisma.favorite.count(),
  notifications: await prisma.notification.count(),
  reports: await prisma.report.count(),
  tokens: await prisma.verificationToken.count(),
};
console.log("ÖNCE:", before);

// 2) Sırayla temizle. User cascade'i çoğunu götürür ama emniyet için
//    önce bağımsız tabloları temizliyoruz; sonra admin DIŞINDAKİ user'ları siler.
console.log("\nSiliniyor...");

// Bildirimler (admin'inkiler de gitsin — "yeni mesaj" gibi artık anlamsız)
const delNotif = await prisma.notification.deleteMany({});
console.log(`  Notification:        ${delNotif.count}`);

// Şikayetler
const delReport = await prisma.report.deleteMany({});
console.log(`  Report:              ${delReport.count}`);

// Mesajlar + konuşmalar
const delMsg = await prisma.message.deleteMany({});
console.log(`  Message:             ${delMsg.count}`);
const delConv = await prisma.conversation.deleteMany({});
console.log(`  Conversation:        ${delConv.count}`);

// Favoriler
const delFav = await prisma.favorite.deleteMany({});
console.log(`  Favorite:            ${delFav.count}`);

// İlanlar
const delList = await prisma.listing.deleteMany({});
console.log(`  Listing:             ${delList.count}`);

// Bekleyen tokenler (eski mail doğrulama/şifre sıfırlama)
const delTok = await prisma.verificationToken.deleteMany({});
console.log(`  VerificationToken:   ${delTok.count}`);

// Rate-limit / oturum tabloları
const delRl = await prisma.rateLimit.deleteMany({});
console.log(`  RateLimit:           ${delRl.count}`);
const delSession = await prisma.session.deleteMany({});
console.log(`  Session:             ${delSession.count}`);
const delAccount = await prisma.account.deleteMany({});
console.log(`  Account:             ${delAccount.count}`);

// Son: admin OLMAYAN tüm kullanıcılar (cascade kalan profil vb. temizler)
const delUsers = await prisma.user.deleteMany({
  where: { role: { not: "ADMIN" } },
});
console.log(`  User (admin hariç):  ${delUsers.count}`);

// 3) Sonraki durum
const after = {
  users: await prisma.user.count(),
  admins: await prisma.user.count({ where: { role: "ADMIN" } }),
  listings: await prisma.listing.count(),
  conversations: await prisma.conversation.count(),
  messages: await prisma.message.count(),
  favorites: await prisma.favorite.count(),
  notifications: await prisma.notification.count(),
  reports: await prisma.report.count(),
  tokens: await prisma.verificationToken.count(),
};
console.log("\nSONRA:", after);

const settings = await prisma.siteSetting.count();
const categories = await prisma.category.count();
const cities = await prisma.city.count();
const ageOptions = await prisma.ageOption.count();
console.log("\nKorunanlar:");
console.log(`  Admin:           ${after.admins}`);
console.log(`  Site ayarları:   ${settings}`);
console.log(`  Kategoriler:     ${categories}`);
console.log(`  Şehirler:        ${cities}`);
console.log(`  Yaş seçenekleri: ${ageOptions}`);
console.log("\nTertemiz ✓");

await prisma.$disconnect();
